import type { Metadata } from 'next'
import { AnalyticsLayer } from '@/components/site-interactions'
import {
  DeliveryAndProcess,
  FAQAndClose,
  ManagementSection,
  Pricing,
  ProblemSection,
  StudioFooter,
  StudioHeader,
  StudioHero,
  type StudioFaq,
} from '@/components/studio-site'
import { commercialConfig } from '@/config/commercial'
import { ReferralCapture } from '@/components/referral-capture'
import { BUSINESS } from '@/lib/business'

export const metadata: Metadata = {
  title: { absolute: 'Website laten maken vanaf €299 | Landingsite.nl' },
  description: 'Websites en landingspagina’s voor zzp en mkb. Eerste werkende versie binnen 48 uur. Bouw vanaf €299 en beheer voor €79 per maand.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Website laten maken vanaf €299 | Landingsite.nl',
    description: 'Een duidelijke website, een werkend formulier en technisch beheer bij één partij. Eerste versie binnen 48 uur na betaling en complete intake.',
    url: 'https://www.landingsite.nl',
  },
}

const faqs: StudioFaq[] = [
  { question: 'Wanneer begint de termijn van 48 uur?', answer: 'De termijn start zodra de betaling is bevestigd en je intake compleet en bruikbaar is. Ontbrekende teksten, beelden of informatie schuiven de start op.' },
  { question: 'Is de website binnen 48 uur definitief live?', answer: 'Nee. Binnen 48 uur ontvang je de eerste werkende versie. Correcties, jouw reactietijd en de domeinkoppeling kunnen daarna extra tijd vragen.' },
  { question: 'Wat betaal ik bij de start?', answer: 'Je betaalt de eenmalige bouwprijs plus de eerste maand Hosting & Websitebeheer. Dat is €378 voor Starter, €578 voor Pro of €978 voor Premium, telkens exclusief btw.' },
  { question: 'Waarom betaal ik daarna €79 per maand?', answer: 'Voor managed hosting, SSL, back-ups, beveiligings- en technische updates, monitoring, formuliercontrole, e-mailondersteuning en maximaal 20 minuten kleine wijzigingen per maand.' },
  { question: 'Wat valt onder de 20 minuten wijzigingen?', answer: 'Kleine aanpassingen binnen de bestaande website, zoals een tekst wijzigen, een afbeelding vervangen of een knop aanpassen. Nieuwe pagina’s, functies en redesigns vallen er niet onder.' },
  { question: 'Worden ongebruikte minuten meegenomen?', answer: 'Nee. Niet-gebruikte wijzigingstijd wordt niet opgespaard of meegenomen naar een volgende maand.' },
  { question: 'Kan ik maandelijks opzeggen?', answer: 'Ja. Opzeggen kan tegen het einde van de lopende betaalperiode. Daarna stoppen hosting, beheer, wijzigingen en ondersteuning. We spreken een redelijke overdracht van domeininstellingen en klantspecifieke content af; extra migratiewerk kan apart worden berekend.' },
  { question: 'Blijf ik eigenaar van mijn domein?', answer: 'Ja. Je domeinnaam blijft van jou en je houdt waar mogelijk zelf toegang tot de registrar.' },
]

const packages = Object.entries(commercialConfig.packages).map(([id, item]) => ({
  '@type': 'Offer',
  name: item.name,
  price: item.oneTimePrice,
  priceCurrency: 'EUR',
  url: `https://www.landingsite.nl/start?pakket=${id}`,
  availability: 'https://schema.org/InStock',
}))

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': 'https://www.landingsite.nl/#organization',
      name: BUSINESS.brandName,
      legalName: BUSINESS.legalName,
      url: BUSINESS.website,
      sameAs: [BUSINESS.social.instagram, BUSINESS.social.linkedin, BUSINESS.social.tiktok],
      taxID: BUSINESS.chamberOfCommerceNumber,
      vatID: BUSINESS.vatId,
      areaServed: 'NL',
    },
    {
      '@type': 'Service',
      name: 'Website en landingspagina laten maken',
      provider: { '@id': 'https://www.landingsite.nl/#organization' },
      areaServed: 'NL',
      offers: packages,
    },
  ],
}

export default function HomePage() {
  return (
    <div className="studio">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <ReferralCapture />
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader />
      <main id="main-content">
        <StudioHero />
        <ProblemSection />
        <DeliveryAndProcess />
        <Pricing />
        <ManagementSection />
        <FAQAndClose faqs={faqs} />
      </main>
      <StudioFooter />
    </div>
  )
}
