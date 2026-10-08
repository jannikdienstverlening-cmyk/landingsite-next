export type PortfolioProject = {
  slug: string
  name: string
  industry: string
  type: string
  description: string
  problem: string
  result: string
  features: string[]
  image: string
  imageAlt: string
  mobileImage: string
  mobileImageAlt: string
  url: string
  domain: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'ontwikkelbegeleiding-rh',
    name: 'Ontwikkelbegeleiding.nl',
    industry: 'Coaching en begeleiding',
    type: 'Website voor lokale dienstverlening',
    description: 'Van een tekstzwaar aanbod naar een rustige website met een duidelijke route naar een kennismaking.',
    problem: 'Bezoekers moesten snel begrijpen welke begeleiding beschikbaar is en voor wie de trajecten bedoeld zijn.',
    result: 'Een rustige presentatie met duidelijke contactmomenten, een verbeterde mobiele ervaring en regionale positionering rond Veenendaal.',
    features: ['Aanbod direct in de hero', 'Eén centrale kennismakingsactie', 'Mobiele navigatie vereenvoudigd'],
    image: '/images/portfolio/ontwikkelbegeleiding-desktop-20260808.webp',
    imageAlt: 'Actuele desktopweergave van de homepage van Ontwikkelbegeleiding.nl',
    mobileImage: '/images/portfolio/ontwikkelbegeleiding-mobile-20260808.webp',
    mobileImageAlt: 'Actuele mobiele weergave van de homepage van Ontwikkelbegeleiding.nl',
    url: 'https://www.ontwikkelbegeleiding.nl/',
    domain: 'ontwikkelbegeleiding.nl',
  },
  {
    slug: 'hadak',
    name: 'Hadak.nl',
    industry: 'Gereedschap voor rietdekkers',
    type: 'Productcatalogus met offerteaanvraag',
    description: 'Gereedschap vinden, een uitvoering kiezen en een offerte aanvragen. Een catalogus voor het dagelijkse werk van de rietdekker.',
    problem: 'Rietdekkers helpen het juiste gereedschap te vinden en hun aanvraag door te geven.',
    result: 'Een website met productcategorieën, een zoekfunctie, productinformatie en een route naar een offerte.',
    features: ['Zoeken op gereedschap of artikelcode', 'Assortiment per productgroep', 'Offerteaanvraag en direct contact'],
    image: '/images/portfolio/hadak-desktop-20261007.webp',
    imageAlt: 'Desktopweergave van Hadak.nl met gereedschap voor rietdekkers en een foto van het werk op een rieten dak',
    mobileImage: '/images/portfolio/hadak-mobile-20261007.webp',
    mobileImageAlt: 'Mobiele weergave van Hadak.nl met het gereedschapsaanbod en de knop naar het assortiment',
    url: 'https://hadak.nl/nl',
    domain: 'hadak.nl',
  },
  {
    slug: 'happyhug',
    name: 'Happyhug.nl',
    industry: 'Verzwaringsknuffels',
    type: 'Productwebsite met bestelroute',
    description: 'Een warme productwebsite voor Happy Hug. Grote beelden van Jari, uitleg over de knuffel en een duidelijke bestelroute.',
    problem: 'De verzwaringsknuffel laten zien en bezoekers helpen met productinformatie, praktische vragen en bestellen.',
    result: 'Een productpresentatie met grote beelden, informatie over gewicht en materiaal, veelgestelde vragen en een winkelmand.',
    features: ['Product en prijs direct zichtbaar', 'Veelgestelde vragen over de knuffel', 'Winkelmand en bestelroute'],
    image: '/images/portfolio/happyhug-desktop-20261007.webp',
    imageAlt: 'Desktopweergave van Happyhug.nl met de verzwaringsknuffel Jari, productinformatie en bestelknop',
    mobileImage: '/images/portfolio/happyhug-mobile-20261007.webp',
    mobileImageAlt: 'Mobiele weergave van Happyhug.nl met Jari, uitleg over de verzwaringsknuffel en bestelknop',
    url: 'https://happyhug.nl/',
    domain: 'happyhug.nl',
  },
]
