import type { Metadata } from 'next'
import {
  AboutJannikSection,
  BenefitsSection,
  ContactSection,
  FAQSection,
  Footer,
  Header,
  Hero,
  PricingSection,
  ProcessSection,
  WebsiteManagementSection,
} from '@/components/home-redesign'
import { HomepageAnalytics } from '@/components/homepage-analytics'
import { PortfolioShowcase } from '@/components/portfolio-showcase'
import { ReferralCapture } from '@/components/referral-capture'
import { SiteChatbot } from '@/components/site-chatbot'
import { pricingConfig } from '@/config/pricing'
import { BUSINESS } from '@/lib/business'
import './homepage.css'

export const metadata: Metadata = {
  title: { absolute: 'Professionele landingspagina laten maken | Landingsite.nl' },
  description: `De eerste versie van jouw professionele landingspagina binnen 48 uur. Voor zzp en mkb, vanaf €${pricingConfig.buildPackages.starter.oneTimePrice} met persoonlijk contact en optioneel Websitebeheer Compleet.`,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Professionele landingspagina laten maken | Landingsite.nl',
    description: `Een duidelijke, mobielvriendelijke landingspagina vanaf €${pricingConfig.buildPackages.starter.oneTimePrice}. Eerste versie binnen 48 uur na complete intake.`,
    url: 'https://landingsite.nl',
  },
}

const faqs = [
  {
    q: 'Wat moet ik zelf aanleveren?',
    a: 'Je deelt je aanbod, doelgroep, contactgegevens, sterke punten en beschikbare beelden via een korte intake. Bij Pro scherpen we je teksten inhoudelijk aan; bij Premium kunnen we ze uitgebreider uitwerken of herschrijven.',
  },
  {
    q: 'Wanneer ontvang ik de eerste versie?',
    a: 'De termijn van 48 uur start zodra de eenmalige bouwprijs is betaald en de intake compleet is. Ontbreekt belangrijke informatie, dan start de termijn zodra die is aangevuld.',
  },
  {
    q: 'Kan ik later extra pagina’s toevoegen?',
    a: `Ja. Nieuwe pagina’s of functionaliteiten vallen buiten het maandelijkse ${pricingConfig.websiteManagement.name} en worden vooraf apart geoffreerd.`,
  },
  {
    q: 'Is de website van mij?',
    a: 'Je domeinnaam blijft van jou. Na betaling mag je de klantspecifieke oplevering voor je eigen onderneming gebruiken. Generieke systemen, componenten en externe licenties blijven onder hun bestaande voorwaarden vallen.',
  },
  {
    q: `Wat zit er in ${pricingConfig.websiteManagement.name}?`,
    a: `Hosting, SSL, back-ups, beveiligings- en technische updates, monitoring, ondersteuning en maximaal ${pricingConfig.websiteManagement.includedChangeMinutes} minuten kleine tekst- of beeldwijzigingen per kalendermaand.`,
  },
  {
    q: 'Kan ik eerst overleggen voordat ik bestel?',
    a: 'Ja. Beschrijf je idee in het formulier. Ik laat weten welk pakket logisch is voordat je iets bestelt.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: pricingConfig.buildPackages.starter.name,
    price: pricingConfig.buildPackages.starter.oneTimePrice,
    fit: 'Voor een eenvoudige campagne, dienst of tijdelijke actie.',
    features: [
      '1 landingspagina',
      'Maximaal 5 inhoudssecties',
      'Standaard contactformulier',
      'Basis-SEO',
      '1 correctieronde',
    ],
  },
  {
    id: 'pro' as const,
    name: pricingConfig.buildPackages.pro.name,
    price: pricingConfig.buildPackages.pro.oneTimePrice,
    fit: 'Voor ondernemers die hun dienst overtuigender willen presenteren.',
    highlighted: true,
    features: [
      '1 uitgebreide landingspagina',
      'Maximaal 8 inhoudssecties',
      'Teksten inhoudelijk aangescherpt',
      'Uitgebreid aanvraagformulier',
      'FAQ- en bewijssecties',
      '2 correctierondes',
    ],
  },
  {
    id: 'premium' as const,
    name: pricingConfig.buildPackages.premium.name,
    price: pricingConfig.buildPackages.premium.oneTimePrice,
    fit: 'Voor bedrijven die meer pagina’s of maatwerk nodig hebben.',
    features: [
      'Maximaal 3 pagina’s',
      'Maatwerkstructuur',
      'Teksten volledig uitgewerkt',
      'Meerdere formulieren of aanvraagflow',
      '3 correctierondes',
    ],
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
      sameAs: [BUSINESS.social.instagram, BUSINESS.social.linkedin],
      taxID: BUSINESS.chamberOfCommerceNumber,
      vatID: BUSINESS.vatId,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.address.street,
        postalCode: BUSINESS.address.postalCode,
        addressLocality: BUSINESS.address.city,
        addressCountry: BUSINESS.address.countryCode,
      },
      description: 'Webdesignbureau voor professionele landingspagina’s en kleine bedrijfswebsites voor zzp en mkb.',
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Professionele landingspagina laten maken',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        price: item.price,
        priceCurrency: 'EUR',
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
    <div className="home-page">
      <ReferralCapture />
      <HomepageAnalytics />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <main>
        <Hero />
        <PortfolioShowcase />
        <BenefitsSection />
        <ProcessSection />
        <PricingSection packages={packages} />
        <WebsiteManagementSection />
        <AboutJannikSection />
        {/* TODO: voeg pas een reviewsectie toe zodra geverifieerde klantreviews en publicatietoestemming beschikbaar zijn. */}
        <FAQSection faqs={faqs} />
        <ContactSection />
      </main>
      <Footer />
      <SiteChatbot />
    </div>
  )
}
