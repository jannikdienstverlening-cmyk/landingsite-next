import {
  BenefitsGrid,
  FAQSection,
  FinalCTA,
  Footer,
  Header,
  Hero,
  PartnerProgramSection,
  PortfolioSection,
  PricingSection,
  ProcessTimeline,
  TestimonialsSection,
} from '@/components/home-redesign'
import { ExitIntentPrompt, StickyMobileCTA } from '@/components/home-actions'
import { BUSINESS } from '@/lib/business'

const faqs = [
  {
    q: 'Wanneer staat mijn website live?',
    a: 'Binnen 48 uur na een compleet startgesprek en aangeleverde basisinput ontvang je de eerste versie. Na jouw akkoord zetten we de website live.',
  },
  {
    q: 'Kan ik overstappen met mijn bestaande website?',
    a: 'Ja. We kijken welke inhoud, domeinnaam en pagina’s mee moeten. Daarna maken we een frisse versie in Landingsite-stijl en helpen we met de overstap.',
  },
  {
    q: 'Wie beheert mijn domein?',
    a: 'Jij blijft eigenaar van je domein. Wij helpen met de juiste koppeling en leggen duidelijk uit welke instelling nodig is bij jouw domeinprovider.',
  },
  {
    q: 'Kan ik later uitbreiden?',
    a: 'Ja. Je kunt starten met één duidelijke website en later uitbreiden met extra pagina’s, funnels, formulieren, AI-optimalisatie of campagnes.',
  },
  {
    q: 'Kan ik zelf teksten aanpassen?',
    a: 'Kleine tekstwijzigingen kun je via ons laten doen binnen je pakket. Wil je zelf volledig beheren, dan bespreken we welke setup daar het beste bij past.',
  },
  {
    q: 'Kan ik opzeggen?',
    a: 'Ja. De maandpakketten zijn bedoeld als doorlopende ontzorging. De exacte opzegtermijn en overdracht spreken we vooraf helder af.',
  },
  {
    q: 'Wat zit er in het maandbedrag?',
    a: 'Hosting, SSL, updates, backups, onderhoud, support en AI-ondersteuning zitten standaard in de pakketten. Je hoeft geen losse technische leveranciers te regelen.',
  },
  {
    q: 'Garanderen jullie meer leads?',
    a: 'Nee. We maken je website duidelijker, sneller en professioneler, maar resultaten hangen ook af van aanbod, markt, verkeer en opvolging.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '€79',
    fit: 'Voor rustig en professioneel online staan',
    tagline: 'Een compacte website met alles wat nodig is om betrouwbaar gevonden te worden.',
    label: 'Plan Starter gesprek',
    features: ['Website live binnen 48 uur', 'Hosting inbegrepen', 'SSL en beveiliging', 'Updates en backups', 'Support per mail', 'AI-ondersteuning'],
  },
  {
    id: 'pro' as const,
    name: 'Groei',
    price: '€129',
    fit: 'Voor ondernemers die aanvragen willen stimuleren',
    tagline: 'Meer bewijs, betere CTA’s en doorlopende optimalisatie voor groei.',
    label: 'Plan Groei gesprek',
    highlighted: true,
    features: ['Alles uit Starter', 'Extra conversiesecties', 'Reviews en portfolio sterker verwerkt', 'AI optimalisatie', 'Maandelijkse verbetercheck', 'Prioriteit bij support'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '€199',
    fit: 'Voor volledige ontzorging en uitbreiding',
    tagline: 'Voor ondernemers die een premium website willen met meer begeleiding.',
    label: 'Plan Premium gesprek',
    features: ['Alles uit Groei', 'Uitbreidbare paginastructuur', 'Meer designmaatwerk', 'Partnerprogramma setup', 'Strategische sparring', 'Snellere doorontwikkeling'],
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
      description: 'Professionele websites en landingspagina’s voor zzp en mkb, inclusief hosting, onderhoud en AI-ondersteuning.',
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Website laten maken met abonnement',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        price: item.price.replace('€', ''),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: item.price.replace('€', ''),
          priceCurrency: 'EUR',
          billingIncrement: 1,
          unitText: 'MONTH',
        },
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
        <BenefitsGrid />
        <TestimonialsSection />
        <PricingSection packages={packages} />
        <ProcessTimeline />
        <PartnerProgramSection />
        <FAQSection faqs={faqs} />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
      <ExitIntentPrompt />
    </>
  )
}
