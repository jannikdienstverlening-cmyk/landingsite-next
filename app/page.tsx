import type { Metadata } from 'next'
import { connection } from 'next/server'
import { AnalyticsLayer } from '@/components/site-interactions'
import {
  DecisionSection,
  FAQAndClose,
  FounderSection,
  ManagementSection,
  Pricing,
  ProcessSection,
  StudioFooter,
  StudioHeader,
  StudioHero,
  type StudioFaq,
} from '@/components/studio-site'
import { activePromotion, commercialConfig, effectiveFirstPayment, packageFirstPayment, promotionDiscount, type ActivePromotion } from '@/config/commercial'
import { ReferralCapture } from '@/components/referral-capture'
import { SocialFeedSection } from '@/components/social-feed'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS } from '@/lib/business'
import { seoMetadata } from '@/lib/seo'

const homepageContent = seoPage('/')
export const metadata: Metadata = seoMetadata(homepageContent)

function homepageFaqs(promotion: ActivePromotion | null): StudioFaq[] {
  const firstPayments = (['starter', 'pro', 'premium'] as const).map((id) => `€${promotion ? effectiveFirstPayment(id) : packageFirstPayment(id)}`)
  return [
    ...(promotion ? [{ question: 'Hoe werkt de zomeractie?', answer: `Tot en met ${promotion.displayEndsAt} kost de Starter-bouw €0 en krijg je €300 korting op de bouw van Pro en Premium. De eerste betaling is €${effectiveFirstPayment('starter')}, €${effectiveFirstPayment('pro')} of €${effectiveFirstPayment('premium')} inclusief de eerste maand Hosting & Websitebeheer. Daarna betaal je €${commercialConfig.management.monthlyPrice} per maand. Je bekijkt de eerste versie vóór publicatie.` }] : []),
    { question: 'Wanneer begint de termijn van 48 uur?', answer: 'De termijn start zodra de betaling is bevestigd en je intake compleet en bruikbaar is. Ontbrekende teksten, beelden of informatie schuiven de start op.' },
    { question: 'Is de website binnen 48 uur definitief live?', answer: 'Nee. Binnen 48 uur ontvang je de eerste werkende versie. Correcties, jouw reactietijd en de domeinkoppeling kunnen daarna extra tijd vragen.' },
    { question: 'Wat betaal ik bij de start?', answer: `Je betaalt de bouwprijs plus de eerste maand Hosting & Websitebeheer. Dat is ${firstPayments[0]} voor Starter, ${firstPayments[1]} voor Pro of ${firstPayments[2]} voor Premium. Deze bedragen zijn inclusief btw.` },
    { question: 'Wat moet ik aanleveren?', answer: 'Na betaling vul je de intake in met je aanbod, doelgroep, contactgegevens, logo, beschikbare teksten en beelden. De termijn begint zodra die informatie compleet en bruikbaar is.' },
    { question: 'Kan ik mijn eigen domein gebruiken?', answer: 'Ja. We helpen met de koppeling van een bestaand domein. Je domeinnaam blijft van jou.' },
    { question: 'Wat zit er in €79 per maand?', answer: 'Managed hosting, SSL, back-ups, beveiligings- en technische updates, monitoring, formuliercontrole, e-mailondersteuning en maximaal 20 minuten kleine wijzigingen per maand.' },
    { question: 'Wat valt onder de 20 minuten wijzigingen?', answer: 'Kleine aanpassingen binnen de bestaande website, zoals een tekst wijzigen, een afbeelding vervangen of een knop aanpassen. Nieuwe pagina’s, functies en redesigns vallen er niet onder.' },
    { question: 'Worden ongebruikte minuten meegenomen?', answer: 'Nee. Niet-gebruikte wijzigingstijd wordt niet opgespaard of meegenomen naar een volgende maand.' },
    { question: 'Kan ik maandelijks opzeggen?', answer: 'Ja. Opzeggen kan tegen het einde van de lopende betaalperiode. Daarna stoppen hosting, technisch beheer, wijzigingen en ondersteuning volgens de algemene voorwaarden.' },
    { question: 'Kan ik zonder telefoongesprek starten?', answer: 'Ja. Je kiest online een pakket, controleert de bestelling, betaalt veilig en vult daarna de intake in. Eerst een praktische vraag stellen kan ook.' },
    { question: 'Wie schrijft de teksten en zijn afbeeldingen inbegrepen?', answer: 'Dat verschilt per pakket. Starter scherpt aangeleverde tekst aan; bij Pro en Premium werken we meer tekst uit op basis van de intake. Fotografie en betaalde beeldbanken zijn niet standaard inbegrepen.' },
    { question: 'Wat als de eerste versie nog niet goed voelt?', answer: 'Je geeft gebundelde feedback binnen de correctierondes van je pakket. De eerste versie is een beoordelingsmoment; publicatie volgt pas na jouw akkoord.' },
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
    ...(promotion ? { priceValidUntil: promotion.priceValidUntil, description: `Tijdelijke zomeractie met €${promotionDiscount(id as keyof typeof commercialConfig.packages)} korting op de bouwprijs, bij Hosting & Websitebeheer van €${commercialConfig.management.monthlyPrice} per maand inclusief btw.` } : {}),
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
        <DecisionSection />
        <Pricing promotion={promotion} />
        <ProcessSection promotion={promotion} />
        <ManagementSection />
        <FounderSection />
        <FAQAndClose faqs={homepageFaqs(promotion)} promotion={promotion} />
        <SocialFeedSection />
      </main>
      <StudioFooter />
    </div>
  )
}
