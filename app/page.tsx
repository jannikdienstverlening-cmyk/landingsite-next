import {
  EssentialsSection,
  FAQContactSection,
  Footer,
  Header,
  Hero,
  PartnerProgramSection,
  PortfolioSection,
  PricingSection,
} from '@/components/home-redesign'
import { StickyMobileCTA } from '@/components/home-actions'
import { BUSINESS } from '@/lib/business'

const faqs = [
  {
    q: 'Wanneer begint de termijn van 48 uur?',
    a: 'De termijn start na betaling en zodra de intake compleet is. Als er belangrijke input ontbreekt, schuift de planning op totdat alles binnen is.',
  },
  {
    q: 'Wat moet ik zelf aanleveren?',
    a: 'Je levert je aanbod, doelgroep, contactgegevens, sterke punten en beschikbare beelden aan. Heb je nog geen teksten? Dan helpen we met een heldere eerste opzet.',
  },
  {
    q: 'Kan ik wijzigingen laten doen?',
    a: 'Ja. Correctierondes hangen af van het gekozen pakket. Kleine aanpassingen bespreken we praktisch, grotere uitbreidingen kunnen apart worden ingepland.',
  },
  {
    q: 'Hoe werkt de hosting?',
    a: 'Managed hosting is optioneel en kost €15 per maand exclusief btw. Hosting wordt alleen na apart akkoord geactiveerd en is maandelijks opzegbaar.',
  },
  {
    q: 'Garandeert een landingspagina meer aanvragen?',
    a: 'Nee. We bouwen een duidelijke, professionele pagina met focus op één doel. Resultaten blijven afhankelijk van je aanbod, verkeer, markt en opvolging.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '€299',
    fit: 'Voor een compacte eerste campagne',
    tagline: 'Een professionele landingspagina met de belangrijkste secties en een werkend formulier.',
    features: ['Eén landingspagina', 'Mobiel geoptimaliseerd', 'Contactformulier', 'Basis SEO-inrichting', 'Eén correctieronde'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '€499',
    fit: 'Voor meer inhoud en vertrouwen',
    tagline: 'Meer ruimte voor bewijs, FAQ, extra secties en een sterkere aanvraagroute.',
    highlighted: true,
    features: ['Alles uit Starter', 'Uitgebreidere structuur', 'Reviews of bewijssectie', 'Twee correctierondes', 'Hulp bij domeinkoppeling'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '€899',
    fit: 'Voor meer maatwerk en begeleiding',
    tagline: 'Een uitgebreidere pagina met meer designaandacht, inhoudelijke hulp en premium afwerking.',
    features: ['Alles uit Pro', 'Meer designmaatwerk', 'Extra contentblokken', 'Drie correctierondes', 'Strategische sparring'],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': 'https://landingsite.nl/#organization',
      name: BUSINESS.brandName,
      legalName: BUSINESS.legalName,
      url: BUSINESS.website,
      email: BUSINESS.email,
      taxID: BUSINESS.chamberOfCommerceNumber,
      vatID: BUSINESS.vatId,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.address.street,
        postalCode: BUSINESS.address.postalCode,
        addressLocality: BUSINESS.address.city,
        addressCountry: BUSINESS.address.countryCode,
      },
      description: 'Professionele landingspagina’s voor zzp en mkb, met eerste versie binnen 48 uur na betaling en complete intake.',
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Landingspagina laten maken',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        price: item.price.replace('€', ''),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <main>
        <Hero />
        <PortfolioSection />
        <EssentialsSection />
        <PricingSection packages={packages} />
        <PartnerProgramSection />
        <FAQContactSection faqs={faqs} />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  )
}
