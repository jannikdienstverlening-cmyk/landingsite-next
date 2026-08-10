export type SeoPageStatus = 'draft' | 'awaiting-review' | 'approved' | 'published' | 'archived'

export type SeoPageEntry = {
  slug: string
  status: SeoPageStatus
  primaryKeyword: string
  secondaryKeywords: string[]
  searchIntent: string
  title: string
  description: string
  canonical: string
  h1: string
  author: string
  reviewer: string
  verifiedAt: string
  updatedAt: string
  indexable: boolean
  includedInSitemap: boolean
  sources: string[]
  relatedPages: string[]
}

const baseUrl = 'https://www.landingsite.nl'
const verifiedAt = '2026-08-09'

export const seoPages: SeoPageEntry[] = [
  {
    slug: '/',
    status: 'published',
    primaryKeyword: 'website laten maken',
    secondaryKeywords: ['professionele website laten maken', 'website laten bouwen', 'website laten maken vanaf €299'],
    searchIntent: 'Brede commerciële oriëntatie en pakketkeuze',
    title: 'Website laten maken vanaf €299 | Landingsite.nl',
    description: 'Laat een professionele website bouwen voor een vaste prijs. Eerste werkende versie binnen 48 uur na complete intake. Bouw vanaf €299 en beheer voor €79 per maand.',
    canonical: `${baseUrl}/`,
    h1: 'Een website laten maken die direct duidelijk maakt wat je doet.',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['config/commercial.ts', 'data/portfolio.ts', 'config/verified-claims.ts'],
    relatedPages: ['/landingspagina-laten-maken', '/website-laten-maken-zzp', '/kosten-website-laten-maken', '/werk', '/over-landingsite', '/start'],
  },
  {
    slug: '/landingspagina-laten-maken',
    status: 'published',
    primaryKeyword: 'landingspagina laten maken',
    secondaryKeywords: ['landing page laten maken', 'landingspage laten maken', 'kosten landingspagina laten maken'],
    searchIntent: 'Een landingspagina vergelijken en bestellen',
    title: 'Landingspagina laten maken vanaf €299 | Landingsite.nl',
    description: 'Laat één duidelijke landingspagina maken met formulier, mobiele uitwerking en basis-SEO. Starter kost €299 plus €79 per maand voor Hosting & Websitebeheer.',
    canonical: `${baseUrl}/landingspagina-laten-maken`,
    h1: 'Een landingspagina laten maken voor één duidelijk doel.',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['config/commercial.ts', 'data/portfolio.ts', 'algemene voorwaarden'],
    relatedPages: ['/', '/kosten-website-laten-maken', '/werk', '/start'],
  },
  {
    slug: '/website-laten-maken-zzp',
    status: 'published',
    primaryKeyword: 'website laten maken zzp',
    secondaryKeywords: ['website voor zzp laten maken', 'zzp website laten maken', 'betaalbare website zzp'],
    searchIntent: 'Een passende website en pakket kiezen als zelfstandige',
    title: 'Website laten maken voor zzp | Landingsite.nl',
    description: 'Een website voor je bedrijf laten maken met een vaste scope en prijs. Kies online een pakket, betaal veilig en lever je informatie aan via de intake.',
    canonical: `${baseUrl}/website-laten-maken-zzp`,
    h1: 'Een website laten maken als zzp’er, met vooraf duidelijke afspraken.',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['config/commercial.ts', 'data/portfolio.ts', 'algemene voorwaarden'],
    relatedPages: ['/', '/kosten-website-laten-maken', '/werk', '/over-landingsite', '/start'],
  },
  {
    slug: '/kosten-website-laten-maken',
    status: 'published',
    primaryKeyword: 'wat kost een website laten maken',
    secondaryKeywords: ['website laten maken kosten', 'prijs website laten maken', 'maandelijkse kosten website'],
    searchIntent: 'Prijsopbouw, pakketverschillen en terugkerende kosten begrijpen',
    title: 'Wat kost een website laten maken? | Landingsite.nl',
    description: 'Bekijk de bouwprijzen, eerste betaling, btw en maandelijkse beheerkosten. Starter €299, Pro €499 en Premium €899, exclusief btw.',
    canonical: `${baseUrl}/kosten-website-laten-maken`,
    h1: 'Wat kost een website laten maken?',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['config/commercial.ts', 'algemene voorwaarden'],
    relatedPages: ['/', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/start'],
  },
  {
    slug: '/werk',
    status: 'published',
    primaryKeyword: 'voorbeelden websites laten maken',
    secondaryKeywords: ['website portfolio', 'webdesign voorbeelden'],
    searchIntent: 'Echte opgeleverde websites bekijken',
    title: 'Live voorbeelden van websites | Landingsite.nl',
    description: 'Bekijk echte websites van Ontwikkelbegeleiding.nl, WIA Management en AIbouwers.nl, inclusief de oorspronkelijke vraag en gemaakte keuzes.',
    canonical: `${baseUrl}/werk`,
    h1: 'Websites die je zelf kunt openen.',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['data/portfolio.ts', 'lokale projectscreenshots'],
    relatedPages: ['/', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/over-landingsite', '/start'],
  },
  {
    slug: '/over-landingsite',
    status: 'published',
    primaryKeyword: 'over Landingsite.nl',
    secondaryKeywords: ['Jannik Dienstverlening', 'werkwijze Landingsite.nl'],
    searchIntent: 'Verantwoordelijkheid, bedrijfsgegevens en werkwijze controleren',
    title: 'Over Landingsite.nl | Werkwijze en verantwoordelijkheid',
    description: 'Lees wie verantwoordelijk is voor Landingsite.nl, hoe het bouwproces werkt en welke onderdelen voor oplevering worden gecontroleerd.',
    canonical: `${baseUrl}/over-landingsite`,
    h1: 'Rechtstreeks contact met degene die je website bouwt.',
    author: 'Jannik', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['lib/business.ts', 'config/verified-claims.ts', 'algemene voorwaarden', 'privacybeleid'],
    relatedPages: ['/', '/werk', '/start', '/privacybeleid', '/algemene-voorwaarden'],
  },
  {
    slug: '/algemene-voorwaarden',
    status: 'published',
    primaryKeyword: 'algemene voorwaarden Landingsite.nl',
    secondaryKeywords: ['voorwaarden Websitebeheer'],
    searchIntent: 'Contractvoorwaarden vooraf controleren',
    title: 'Algemene voorwaarden bouw en Websitebeheer | Landingsite.nl',
    description: 'Zakelijke voorwaarden voor websitebouw en Hosting & Websitebeheer van Landingsite.nl.',
    canonical: `${baseUrl}/algemene-voorwaarden`,
    h1: 'Algemene voorwaarden',
    author: 'Jannik Dienstverlening', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['app/algemene-voorwaarden/page.tsx'],
    relatedPages: ['/', '/kosten-website-laten-maken', '/privacybeleid', '/start'],
  },
  {
    slug: '/privacybeleid',
    status: 'published',
    primaryKeyword: 'privacybeleid Landingsite.nl',
    secondaryKeywords: ['privacy website intake'],
    searchIntent: 'Gegevensverwerking vooraf controleren',
    title: 'Privacybeleid voor klanten en bezoekers | Landingsite.nl',
    description: 'Hoe Landingsite.nl persoonsgegevens van klanten, websitebezoekers en leads verwerkt en beschermt.',
    canonical: `${baseUrl}/privacybeleid`,
    h1: 'Privacybeleid',
    author: 'Jannik Dienstverlening', reviewer: 'Jannik', verifiedAt, updatedAt: verifiedAt,
    indexable: true, includedInSitemap: true,
    sources: ['app/privacybeleid/page.tsx', 'config/vendors.ts'],
    relatedPages: ['/', '/algemene-voorwaarden', '/start'],
  },
]

export const publishedSeoPages = seoPages.filter((page) =>
  (page.status === 'approved' || page.status === 'published') && page.indexable,
)

export function seoPage(slug: SeoPageEntry['slug']) {
  const page = seoPages.find((entry) => entry.slug === slug)
  if (!page) throw new Error(`SEO-register mist route ${slug}`)
  return page
}
