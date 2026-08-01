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
    a: 'De termijn voor de eerste versie start na de eerste succesvolle abonnementsbetaling en zodra de intake compleet is. Ontbreekt belangrijke input, dan start de termijn zodra die is aangevuld.',
  },
  {
    q: 'Wat moet ik zelf aanleveren?',
    a: 'Je levert je aanbod, doelgroep, contactgegevens, sterke punten en beschikbare beelden aan. Heb je nog geen teksten? Dan helpen we met een heldere eerste opzet.',
  },
  {
    q: 'Wat zit er in het maandbedrag?',
    a: 'Hosting, SSL, technische updates, backups, onderhoud, support en de afgesproken websiteomvang. De precieze inhoud en correctieruimte staan per pakket vermeld.',
  },
  {
    q: 'Kan ik later uitbreiden?',
    a: 'Ja. Je kunt overstappen naar een ruimer pakket of extra werk laten inplannen. We spreken vooraf duidelijk af wat binnen je abonnement valt en wat aanvullend werk is.',
  },
  {
    q: 'Kan ik maandelijks opzeggen?',
    a: 'Ja. Het abonnement loopt voor onbepaalde tijd en is per maand opzegbaar tegen het einde van de lopende betaalperiode. Na opzegging stoppen hosting, onderhoud en support aan het einde van die periode; een overdracht spreken we praktisch af.',
  },
  {
    q: 'Garandeert de website meer aanvragen?',
    a: 'Nee. We bouwen en onderhouden een professionele website met een duidelijke route naar contact. Resultaten blijven afhankelijk van je aanbod, verkeer, markt en opvolging.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '€79',
    fit: 'Voor een compacte professionele basis',
    tagline: 'Een scherpe website met de belangrijkste secties, beheer en een werkend formulier.',
    features: ['Eén landingspagina', 'Hosting en SSL', 'Updates en backups', 'Contactformulier', 'Basis SEO', 'Support'],
  },
  {
    id: 'pro' as const,
    name: 'Groei',
    price: '€129',
    fit: 'Voor bedrijven die zichtbaar willen groeien',
    tagline: 'Meer ruimte voor bewijs, inhoud, optimalisatie en een sterkere aanvraagroute.',
    highlighted: true,
    features: ['Alles uit Starter', 'Uitgebreidere structuur', 'Bewijs- en FAQ-secties', 'Doorlopende kleine optimalisaties', 'Hulp bij domein en e-mail', 'Snellere support'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '€199',
    fit: 'Voor meer maatwerk en begeleiding',
    tagline: 'Een uitgebreidere website met meer maatwerk, begeleiding en ruimte om door te ontwikkelen.',
    features: ['Alles uit Groei', 'Meer designmaatwerk', 'Extra pagina of campagneflow', 'Inhoudelijke begeleiding', 'Maandelijkse optimalisatieruimte', 'Prioriteitssupport'],
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
      description: 'Professionele websites voor zzp en mkb in een maandelijks abonnement, met eerste versie binnen 48 uur na betaling en complete intake.',
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Websiteabonnement met hosting en onderhoud',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        price: item.price.replace('€', ''),
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: item.price.replace('€', ''),
          priceCurrency: 'EUR',
          unitCode: 'MON',
        },
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
