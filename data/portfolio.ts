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
    slug: 'wia-management',
    name: 'WIA Management',
    industry: 'B2B en HR-dienstverlening',
    type: 'Intake en specialistintroductie',
    description: 'Een zakelijke website die werkgevers langs een begrijpelijke route naar relevante WIA- en WGA-expertise leidt.',
    problem: 'Een complex onderwerp moest begrijpelijk worden zonder medische beoordeling of onduidelijkheid over gegevensdeling.',
    result: 'Een transparante route van werkgeversvraag en categorisering naar toestemming en een mogelijke specialistintroductie.',
    features: ['Gerichte intake', 'Vraagwijzer', 'Toestemmingsroute', 'Specialistintroductie'],
    image: '/images/portfolio/wiamanagement-desktop-20260808.webp',
    imageAlt: 'Actuele desktopweergave van de homepage van WIA Management',
    mobileImage: '/images/portfolio/wiamanagement-mobile-20260808.webp',
    mobileImageAlt: 'Actuele mobiele weergave van de homepage van WIA Management',
    url: 'https://www.wiamanagement.nl/',
    domain: 'wiamanagement.nl',
  },
  {
    slug: 'aibouwers',
    name: 'AIbouwers.nl',
    industry: 'Procesautomatisering',
    type: 'Integraties en procesautomatisering',
    description: 'Een productwebsite die technische automatisering vertaalt naar concrete toepassingen voor ondernemers.',
    problem: 'Technische diensten moesten concreet en begrijpelijk worden voor ondernemers zonder technisch jargon.',
    result: 'Een overzichtelijke productwebsite met praktische toepassingen, een gratis scan en een duidelijke werkwijze.',
    features: ['Gratis scan', 'Praktische toepassingen', 'Productvoorbeeld', 'Menselijke controle'],
    image: '/images/portfolio/aibouwers-desktop-20260808.webp',
    imageAlt: 'Actuele desktopweergave van de homepage van AIbouwers.nl',
    mobileImage: '/images/portfolio/aibouwers-mobile-20260808.webp',
    mobileImageAlt: 'Actuele mobiele weergave van de homepage van AIbouwers.nl',
    url: 'https://aibouwers.nl/',
    domain: 'aibouwers.nl',
  },
]
