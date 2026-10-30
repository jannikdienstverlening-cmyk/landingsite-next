import type { Metadata } from 'next'
import { connection } from 'next/server'
import { DM_Sans, Lora } from 'next/font/google'
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
import { commercialConfig, websiteOffer } from '@/config/commercial'
import { ReferralCapture } from '@/components/referral-capture'
import { SocialFeedSection } from '@/components/social-feed'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS } from '@/lib/business'
import { seoMetadata } from '@/lib/seo'
import styles from './calm-home.module.css'

const calmSans = DM_Sans({ subsets: ['latin'], variable: '--font-calm-sans', display: 'swap' })
const calmSerif = Lora({ subsets: ['latin'], weight: '400', variable: '--font-calm-serif', display: 'swap' })

const homepageContent = seoPage('/')
export const metadata: Metadata = seoMetadata(homepageContent)

function homepageFaqs(): StudioFaq[] {
  return [
    { question: 'Wanneer krijg ik de eerste versie?', answer: 'Binnen 48 uur nadat je betaling is bevestigd en je intake compleet en bruikbaar is. De intake is de vragenlijst over je bedrijf. Ontbreken teksten, beelden of informatie? Dan begint de termijn zodra alles binnen is.' },
    { question: 'Is de website binnen 48 uur definitief live?', answer: 'Nee. Binnen 48 uur ontvang je de eerste werkende versie. Correcties, jouw reactietijd en de domeinkoppeling kunnen daarna extra tijd vragen.' },
    { question: 'Wat betaal ik bij de start?', answer: `Je betaalt €${commercialConfig.management.monthlyPrice} inclusief btw voor de eerste maand. De websitebouw is inbegrepen: je betaalt geen eenmalige bouwkosten. Daarna betaal je hetzelfde bedrag per maand.` },
    { question: `Wat zit er in €${commercialConfig.management.monthlyPrice} per maand?`, answer: `Hosting, een beveiligde verbinding (SSL), back-ups, updates en controle van je website en formulier. Je krijgt ook hulp per e-mail en maximaal ${commercialConfig.management.includedChangeMinutes} minuten per maand voor kleine tekst- of afbeeldingswijzigingen.` },
    { question: `Wat valt onder de ${commercialConfig.management.includedChangeMinutes} minuten wijzigingen?`, answer: 'Kleine aanpassingen binnen de bestaande website, zoals een tekst wijzigen, een afbeelding vervangen of een knop aanpassen. Nieuwe pagina’s, functies en redesigns vallen er niet onder. De tijd geldt per betaalmaand en is niet overdraagbaar.' },
    { question: 'Worden ongebruikte minuten meegenomen?', answer: 'Nee. Niet-gebruikte wijzigingstijd wordt niet opgespaard of meegenomen naar een volgende maand.' },
    { question: 'Kan ik maandelijks opzeggen?', answer: 'Ja, tegen het einde van de betaalperiode. Daarna stoppen hosting, beheer en het gebruik van onze code en ons ontwerp binnen het abonnement. Je eigen materiaal en domeinnaam blijven van jou. Zelfstandig verdergaan met de website kan via een aparte afkoopafspraak. Opzeggen verplicht je niet tot afkoop. Eerder overeengekomen rechten blijven gelden.' },
    { question: 'Blijf ik eigenaar van mijn domein?', answer: 'Ja. Je domeinnaam blijft van jou en je houdt waar mogelijk zelf toegang tot de registrar.' },
    { question: 'Van wie zijn de teksten, foto’s en de website?', answer: 'Je eigen teksten, foto’s, logo en andere aangeleverde materialen blijven van jou. Je gebruikt onze websitecode en ons ontwerp binnen het abonnement; deze worden niet automatisch jouw eigendom. Onderdelen van andere makers houden hun eigen licenties. De voorwaarden leggen dit verder uit.' },
    { question: 'Kan ik de website later overnemen?', answer: 'Je kunt een eenmalige afkoopofferte aanvragen. We spreken de prijs, de overdraagbare code en rechten en de hulp bij de verhuizing vooraf schriftelijk af. Afkoop zit niet in het maandbedrag. Je krijgt geen rechten op onderdelen die we zelf niet mogen overdragen.' },
  ]
}

export default async function HomePage() {
  await connection()
  const offers = [{
    '@type': 'Offer',
    name: websiteOffer.name,
    price: commercialConfig.management.monthlyPrice,
    priceCurrency: 'EUR',
    url: `https://www.landingsite.nl${websiteOffer.ctaHref}`,
    availability: 'https://schema.org/InStock',
    description: 'Websitebouw, hosting en beheer inbegrepen. Maandelijks opzegbaar, inclusief btw.',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: commercialConfig.management.monthlyPrice, priceCurrency: commercialConfig.currency, valueAddedTaxIncluded: true, unitText: 'maand', billingDuration: 'P1M' },
  }]
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
          name: 'Website inclusief bouw en beheer',
          itemListElement: offers,
        },
      },
    ],
  }
  return (
    <div className={`studio studio--sales ${styles.home} ${calmSans.variable} ${calmSerif.variable}`}>
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <ReferralCapture />
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader light />
      <main id="main-content">
        <StudioHero />
        <Pricing />
        <ProcessSection />
        <FounderSection />
        <ManagementSection />
        <FAQAndClose faqs={homepageFaqs()} />
        <SocialFeedSection />
      </main>
      <StudioFooter />
    </div>
  )
}
