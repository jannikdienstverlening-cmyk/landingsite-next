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
    slug: 'dippingpools',
    name: 'Dippingpools.com',
    industry: 'Compacte zwembaden',
    type: 'Productwebsite met offerteaanvraag',
    description: 'Compacte zwembaden in beeld, met een vergelijking van de modellen en een offerteaanvraag voor de gekozen uitvoering.',
    problem: 'Laten zien hoe een Dippingpool in de tuin past en bezoekers helpen een model en indeling te kiezen.',
    result: 'Een website met grote projectfoto’s, drie modellen, uitleg over de plaatsing en een offerteformulier met modelkeuze.',
    features: ['Grote foto’s van geplaatste zwembaden', 'Drie modellen naast elkaar', 'Modelkeuze mee naar de offerteaanvraag'],
    image: '/images/portfolio/dippingpools-desktop-20261104.webp',
    imageAlt: 'Desktopweergave van Dippingpools.com met een compact zwembad in een houten terras en de offerteknop',
    mobileImage: '/images/portfolio/dippingpools-mobile-20261104.webp',
    mobileImageAlt: 'Mobiele weergave van Dippingpools.com met de introductie van compacte zwembaden en de offerteknop',
    url: 'https://dippingpools.com/',
    domain: 'dippingpools.com',
  },
  {
    slug: 'ontwikkelbegeleiding-rh',
    name: 'Ontwikkelbegeleiding.nl',
    industry: 'Coaching en begeleiding',
    type: 'Website voor lokale dienstverlening',
    description: 'Van een tekstzwaar aanbod naar een rustige website met een duidelijke route naar een kennismaking.',
    problem: 'Bezoekers moesten snel begrijpen welke begeleiding beschikbaar is en voor wie de trajecten bedoeld zijn.',
    result: 'Een rustige presentatie met duidelijke contactmomenten, een verbeterde mobiele ervaring en regionale positionering rond Veenendaal.',
    features: ['Aanbod direct in de hero', 'Eén centrale kennismakingsactie', 'Mobiele navigatie vereenvoudigd'],
    image: '/images/portfolio/ontwikkelbegeleiding-desktop-20261011.webp',
    imageAlt: 'Actuele desktopweergave van de homepage van Ontwikkelbegeleiding.nl',
    mobileImage: '/images/portfolio/ontwikkelbegeleiding-mobile-20261011.webp',
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
    image: '/images/portfolio/hadak-desktop-20261011.webp',
    imageAlt: 'Desktopweergave van Hadak.nl met gereedschap voor rietdekkers en een foto van het werk op een rieten dak',
    mobileImage: '/images/portfolio/hadak-mobile-20261011.webp',
    mobileImageAlt: 'Mobiele weergave van Hadak.nl met het gereedschapsaanbod en de knop naar het assortiment',
    url: 'https://hadak.nl/nl',
    domain: 'hadak.nl',
  },
  {
    slug: 'jhszwembaden',
    name: 'JHS Zwembaden',
    industry: 'Zwembadaanleg en onderhoud',
    type: 'Bedrijfswebsite met projectgalerij',
    description: 'Een website voor zwembadaanleg, buitenspa’s en onderhoud. Met projectfoto’s en een directe route naar een offerte of servicevraag.',
    problem: 'Bezoekers het werk van JHS laten bekijken en helpen de juiste dienst en contactroute te vinden.',
    result: 'Een bedrijfswebsite met aparte dienstenpagina’s, een projectgalerij en contactmogelijkheden voor aanleg en onderhoud.',
    features: ['Echte zwembadprojecten op de homepage', 'Aparte pagina’s voor de diensten', 'Offerte en onderhoud bereikbaar via contact'],
    image: '/images/portfolio/jhszwembaden-desktop-20261104.webp',
    imageAlt: 'Desktopweergave van JHS Zwembaden met een aangelegd buitenbad, uitleg over aanleg en onderhoud en een offerteknop',
    mobileImage: '/images/portfolio/jhszwembaden-mobile-20261104.webp',
    mobileImageAlt: 'Mobiele weergave van JHS Zwembaden met de introductie, een zwembadproject en de route naar een offerte',
    url: 'https://www.jhszwembaden.nl/',
    domain: 'jhszwembaden.nl',
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
    image: '/images/portfolio/happyhug-desktop-20261011.webp',
    imageAlt: 'Desktopweergave van Happyhug.nl met de verzwaringsknuffel Jari, productinformatie en bestelknop',
    mobileImage: '/images/portfolio/happyhug-mobile-20261011.webp',
    mobileImageAlt: 'Mobiele weergave van Happyhug.nl met Jari, uitleg over de verzwaringsknuffel en bestelknop',
    url: 'https://happyhug.nl/',
    domain: 'happyhug.nl',
  },
]
