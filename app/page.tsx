import type { Metadata } from 'next'
import { connection } from 'next/server'
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
import { activePromotion, commercialConfig, type ActivePromotion } from '@/config/commercial'
import { ReferralCapture } from '@/components/referral-capture'
import { SocialFeedSection } from '@/components/social-feed'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS } from '@/lib/business'
import { seoMetadata } from '@/lib/seo'

const homepageContent = seoPage('/')
export const metadata: Metadata = seoMetadata(homepageContent)

function homepageFaqs(promotion: ActivePromotion | null): StudioFaq[] {
  return [
    ...(promotion ? [{ question: 'Hoe werkt de zomeractie?', answer: `Bij Starter vervalt tot en met ${promotion.displayEndsAt} de eenmalige bouwprijs van €${commercialConfig.packages.starter.oneTimePrice}. Je betaalt bij de start alleen de eerste maand Hosting & Websitebeheer van €${commercialConfig.management.monthlyPrice} inclusief btw. Na een complete intake ontvang je de eerste werkende versie. We publiceren pas nadat jij de preview hebt bekeken en akkoord hebt gegeven.` }] : []),
    { question: 'Wanneer begint de termijn van 48 uur?', answer: 'De termijn start zodra de betaling is bevestigd en je intake compleet en bruikbaar is. Ontbrekende teksten, beelden of informatie schuiven de start op.' },
    { question: 'Is de website binnen 48 uur definitief live?', answer: 'Nee. Binnen 48 uur ontvang je de eerste werkende versie. Correcties, jouw reactietijd en de domeinkoppeling kunnen daarna extra tijd vragen.' },
    { question: 'Wat betaal ik bij de start?', answer: promotion ? `Tijdens de zomeractie betaal je voor Starter €${commercialConfig.management.monthlyPrice} inclusief btw: €${promotion.buildPrice} bouwprijs en €${commercialConfig.management.monthlyPrice} voor de eerste maand Hosting & Websitebeheer. Pro kost bij de start €578 en Premium €978 inclusief btw.` : 'Je betaalt de eenmalige bouwprijs plus de eerste maand Hosting & Websitebeheer. Dat is €378 voor Starter, €578 voor Pro of €978 voor Premium, telkens inclusief btw.' },
    { question: 'Wat zit er in €79 per maand?', answer: 'Managed hosting, SSL, back-ups, beveiligings- en technische updates, monitoring, formuliercontrole, e-mailondersteuning en maximaal 20 minuten kleine wijzigingen per maand.' },
    { question: 'Wat valt onder de 20 minuten wijzigingen?', answer: 'Kleine aanpassingen binnen de bestaande website, zoals een tekst wijzigen, een afbeelding vervangen of een knop aanpassen. Nieuwe pagina’s, functies en redesigns vallen er niet onder.' },
    { question: 'Worden ongebruikte minuten meegenomen?', answer: 'Nee. Niet-gebruikte wijzigingstijd wordt niet opgespaard of meegenomen naar een volgende maand.' },
    { question: 'Kan ik maandelijks opzeggen?', answer: 'Ja. Opzeggen kan tegen het einde van de lopende betaalperiode. Daarna stoppen hosting, beheer, wijzigingen en ondersteuning. We spreken een redelijke overdracht van domeininstellingen en klantspecifieke content af; extra migratiewerk kan apart worden berekend.' },
    ...(promotion ? [] : [{ question: 'Blijf ik eigenaar van mijn domein?', answer: 'Ja. Je domeinnaam blijft van jou en je houdt waar mogelijk zelf toegang tot de registrar.' }]),
  ]
}

export default async function HomePage() {
  await connection()
  const promotion = activePromotion()
  const packages = Object.entries(commercialConfig.packages).map(([id, item]) => ({
    '@type': 'Offer',
    name: item.name,
    price: promotion?.packageId === id ? promotion.buildPrice : item.oneTimePrice,
    priceCurrency: 'EUR',
    url: `https://www.landingsite.nl/start?pakket=${id}`,
    availability: 'https://schema.org/InStock',
    ...(promotion?.packageId === id ? { priceValidUntil: '2026-10-01', description: 'Tijdelijk €0 bouwprijs bij verplicht Hosting & Websitebeheer van €79 per maand inclusief btw.' } : {}),
  }))
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
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
        '@type': 'WebSite',
        '@id': 'https://www.landingsite.nl/#website',
        name: BUSINESS.brandName,
        url: BUSINESS.website,
        publisher: { '@id': 'https://www.landingsite.nl/#organization' },
        inLanguage: 'nl-NL',
      },
      {
        '@type': 'Service',
        name: 'Website en landingspagina laten maken',
        provider: { '@id': 'https://www.landingsite.nl/#organization' },
        areaServed: 'NL',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Websitebouwpakketten',
          itemListElement: packages,
        },
      },
    ],
  }
  return (
    <div className="studio">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <ReferralCapture />
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader />
      <main id="main-content">
        <StudioHero promotion={promotion} />
        <ProblemSection />
        <DeliveryAndProcess promotion={promotion} />
        <Pricing promotion={promotion} />
        <ManagementSection />
        <FAQAndClose faqs={homepageFaqs(promotion)} promotion={promotion} />
        <SocialFeedSection />
      </main>
      <StudioFooter />
    </div>
  )
}
