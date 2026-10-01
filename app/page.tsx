import type { Metadata } from 'next'
import { connection } from 'next/server'
import { AnalyticsLayer } from '@/components/site-interactions'
import {
  ProcessSection,
  FAQAndClose,
  FounderSection,
  ManagementSection,
  Pricing,
  StudioFooter,
  StudioHeader,
  StudioHero,
  type StudioFaq,
} from '@/components/studio-site'
import { activePromotion, commercialConfig, packageFirstPayment, type ActivePromotion, type CommercialPackageId } from '@/config/commercial'
import { ReferralCapture } from '@/components/referral-capture'
import { SocialFeedSection } from '@/components/social-feed'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS } from '@/lib/business'
import { seoMetadata } from '@/lib/seo'

const homepageContent = seoPage('/')
export const metadata: Metadata = seoMetadata(homepageContent)

function homepageFaqs(promotion: ActivePromotion | null): StudioFaq[] {
  const firstPayment = (id: CommercialPackageId) => (promotion?.buildPrices[id] ?? commercialConfig.packages[id].oneTimePrice) + commercialConfig.management.monthlyPrice
  return [
    ...(promotion ? [{ question: 'Hoe werkt de zomeractie?', answer: `Tot en met ${promotion.displayEndsAt} kost de Starter-bouw €${promotion.buildPrices.starter} en krijg je €${commercialConfig.packages.pro.oneTimePrice - promotion.buildPrices.pro} korting op de bouw van Pro en Premium. De eerste betaling is €${firstPayment('starter')}, €${firstPayment('pro')} of €${firstPayment('premium')}, inclusief btw en de eerste maand Hosting & Websitebeheer. Daarna betaal je €${commercialConfig.management.monthlyPrice} per maand inclusief btw. Je bekijkt de eerste versie vóór publicatie.` }] : []),
    { question: 'Wanneer begint de termijn van 48 uur?', answer: 'De termijn start zodra de betaling is bevestigd en je intake compleet en bruikbaar is. Ontbrekende teksten, beelden of informatie schuiven de start op.' },
    { question: 'Is de website binnen 48 uur definitief live?', answer: 'Nee. Binnen 48 uur ontvang je de eerste werkende versie. Correcties, jouw reactietijd en de domeinkoppeling kunnen daarna extra tijd vragen.' },
    { question: 'Wat betaal ik bij de start?', answer: promotion ? `Tijdens de zomeractie betaal je bij de start €${firstPayment('starter')} voor Starter, €${firstPayment('pro')} voor Pro of €${firstPayment('premium')} voor Premium. Deze bedragen zijn inclusief btw en de eerste maand Hosting & Websitebeheer.` : `Je betaalt de eenmalige bouwprijs plus de eerste maand Hosting & Websitebeheer. Dat is €${packageFirstPayment('starter')} voor Starter, €${packageFirstPayment('pro')} voor Pro of €${packageFirstPayment('premium')} voor Premium, telkens inclusief btw.` },
    { question: `Wat zit er in €${commercialConfig.management.monthlyPrice} per maand?`, answer: `Managed hosting, SSL, back-ups, beveiligings- en technische updates, monitoring, formuliercontrole, e-mailondersteuning en maximaal ${commercialConfig.management.includedChangeMinutes} minuten kleine wijzigingen per maand.` },
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
    price: promotion ? promotion.buildPrices[id as keyof typeof promotion.buildPrices] : item.oneTimePrice,
    priceCurrency: 'EUR',
    url: `https://www.landingsite.nl/start?pakket=${id}`,
    availability: 'https://schema.org/InStock',
    ...(promotion ? { priceValidUntil: '2026-10-01', description: `Tijdelijke zomeractie met €${item.oneTimePrice - promotion.buildPrices[id as CommercialPackageId]} korting op de bouwprijs, bij Hosting & Websitebeheer van €${commercialConfig.management.monthlyPrice} per maand inclusief btw.` } : {}),
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
        <Pricing promotion={promotion} />
        <ProcessSection />
        <ManagementSection />
        <FounderSection />
        <FAQAndClose faqs={homepageFaqs(promotion)} promotion={promotion} />
        <SocialFeedSection />
      </main>
      <StudioFooter />
    </div>
  )
}
