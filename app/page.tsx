import {
  EssentialsSection,
  FAQContactSection,
  Footer,
  Header,
  Hero,
  PartnerProgramSection,
  PortfolioSection,
  PricingSection,
  WebsiteManagementSection,
} from '@/components/home-redesign'
import { StickyMobileCTA } from '@/components/home-actions'
import { ReferralCapture } from '@/components/referral-capture'
import { pricingConfig } from '@/config/pricing'
import { BUSINESS } from '@/lib/business'

const faqs = [
  {
    q: 'Wanneer begint de termijn van 48 uur?',
    a: 'De termijn voor de eerste versie start na de succesvolle betaling van de eenmalige bouwprijs en zodra de intake compleet is. Ontbreekt belangrijke input, dan start de termijn zodra die is aangevuld.',
  },
  {
    q: 'Wat moet ik zelf aanleveren?',
    a: 'Je levert je aanbod, doelgroep, contactgegevens, sterke punten en beschikbare beelden aan. Heb je nog geen teksten? Dan helpen we met een heldere eerste opzet.',
  },
  {
    q: `Wat zit er in Websitebeheer van €${pricingConfig.websiteManagement.monthlyPrice} per maand?`,
    a: 'Websitebeheer bevat managed hosting, beveiliging, back-ups, technische updates, monitoring, hulp bij problemen en een beperkte hoeveelheid kleine wijzigingen binnen de bestaande website.',
  },
  {
    q: 'Wanneer start het maandelijkse abonnement?',
    a: 'Het abonnement start wanneer de website na jouw goedkeuring live gaat. De eenmalige bouwprijs betaal je bij de start van het project. Voor Websitebeheer ontvang je bij livegang een aparte beveiligde abonnementslink.',
  },
  {
    q: 'Kan ik Websitebeheer opzeggen?',
    a: 'Ja, volgens de afgesproken opzegvoorwaarden. Na beëindiging stoppen hosting, technisch beheer, wijzigingen en toekomstige partnercommissies die aan dat abonnement zijn gekoppeld.',
  },
  {
    q: 'Hoe verdien ik €475 per maand?',
    a: '€475 is een rekenvoorbeeld met vijf directe klanten, 25 klanten op niveau 2 en 125 klanten op niveau 3. Het is geen gegarandeerd resultaat. Alleen actieve en betaalde abonnementen tellen mee.',
  },
  {
    q: 'Moet ik betalen om partner te worden?',
    a: 'Nee. Deelname aan het partnerprogramma is gratis. Je ontvangt alleen een vergoeding wanneer een daadwerkelijk aangebrachte klant een actief en betaald Websitebeheer-abonnement heeft.',
  },
  {
    q: 'Krijg ik betaald voor het aanmelden van nieuwe partners?',
    a: 'Nee. Alleen omzet uit echte, actieve en betaalde Websitebeheer-abonnementen kan commissie opleveren.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: pricingConfig.buildPackages.starter.name,
    price: `€${pricingConfig.buildPackages.starter.oneTimePrice}`,
    fit: 'Voor een compacte campagne of dienst',
    tagline: 'Een scherpe landingspagina met de belangrijkste secties en een werkend formulier.',
    features: ['Eén landingspagina', 'Responsive ontwerp', 'Contactformulier', 'Basis SEO', 'Domeinkoppeling bij livegang'],
  },
  {
    id: 'pro' as const,
    name: pricingConfig.buildPackages.pro.name,
    price: `€${pricingConfig.buildPackages.pro.oneTimePrice}`,
    fit: 'Voor een uitgebreidere conversiepagina',
    tagline: 'Meer ruimte voor bewijs, inhoud en een sterkere aanvraagroute.',
    highlighted: true,
    features: ['Alles uit Starter', 'Uitgebreidere structuur', 'Bewijs- en FAQ-secties', 'Extra formulierlogica', 'Uitgebreide SEO-basis'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: `€${pricingConfig.buildPackages.premium.oneTimePrice}`,
    fit: 'Voor meer maatwerk en begeleiding',
    tagline: 'Een uitgebreidere website met meer maatwerk, begeleiding en een rijkere campagneflow.',
    features: ['Alles uit Pro', 'Meer designmaatwerk', 'Extra pagina of campagneflow', 'Inhoudelijke begeleiding', 'Uitgebreide oplevercheck'],
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
      description: `Professionele landingspagina's voor zzp en mkb vanaf €${pricingConfig.buildPackages.starter.oneTimePrice}, met Websitebeheer voor €${pricingConfig.websiteManagement.monthlyPrice} per maand vanaf livegang.`,
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Landingspagina laten maken en Websitebeheer',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        price: item.price.replace('€', ''),
        priceCurrency: 'EUR',
        priceSpecification: { '@type': 'PriceSpecification', price: item.price.replace('€', ''), priceCurrency: 'EUR' },
        availability: 'https://schema.org/InStock',
      })),
    },
    {
      '@type': 'Service',
      name: pricingConfig.websiteManagement.name,
      provider: { '@id': 'https://landingsite.nl/#organization' },
      offers: {
        '@type': 'Offer',
        price: pricingConfig.websiteManagement.monthlyPrice,
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: pricingConfig.websiteManagement.monthlyPrice,
          priceCurrency: 'EUR',
          unitCode: 'MON',
        },
      },
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
      <ReferralCapture />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <main>
        <Hero />
        <PortfolioSection />
        <EssentialsSection />
        <PricingSection packages={packages} />
        <WebsiteManagementSection />
        <PartnerProgramSection />
        <FAQContactSection faqs={faqs} />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  )
}
