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
  url: string
  domain: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'ontwikkelbegeleiding-rh',
    name: 'Ontwikkelbegeleiding.nl',
    industry: 'Coaching en begeleiding',
    type: 'Website voor lokale dienstverlening',
    description:
      'Van een onduidelijk en tekstzwaar aanbod naar een warme, professionele website met een duidelijke route naar een kennismaking.',
    problem: 'Bezoekers moesten snel begrijpen welke begeleiding beschikbaar is en voor wie de trajecten bedoeld zijn.',
    result: 'Een rustige presentatie met duidelijke contactmomenten, een verbeterde mobiele ervaring en regionale positionering rond Veenendaal.',
    features: ['Rustige uitstraling', 'Duidelijke trajecten', 'Mobiele ervaring', 'Kennismakingsroute', 'Regio Veenendaal'],
    image: '/images/portfolio/ontwikkelbegeleiding-home-20260801.webp',
    imageAlt: 'Screenshot van de actuele homepage van Ontwikkelbegeleiding RH',
    url: 'https://www.ontwikkelbegeleiding.nl/',
    domain: 'ontwikkelbegeleiding.nl',
  },
  {
    slug: 'wia-management',
    name: 'WIA Management',
    industry: 'B2B en HR-dienstverlening',
    type: 'Intake en specialistintroductie',
    description:
      'Een zakelijke website voor werkgevers, HR en eigenrisicodragers die snel de relevante expertise bij een WIA- of WGA-vraagstuk willen vinden.',
    problem: 'Een complex onderwerp moest begrijpelijk worden zonder medische beoordeling of onduidelijkheid over gegevensdeling.',
    result: 'Een transparante route van werkgeversvraag en categorisering naar toestemming en een mogelijke specialistintroductie.',
    features: ['Gerichte intake', 'Vraagwijzer', 'Toestemmingsroute', 'Specialistintroductie'],
    image: '/images/portfolio/wiamanagement-home-20260807.webp',
    imageAlt: 'Screenshot van de actuele homepage van WIA Management',
    url: 'https://www.wiamanagement.nl/',
    domain: 'wiamanagement.nl',
  },
  {
    slug: 'aibouwers',
    name: 'AIbouwers.nl',
    industry: 'AI en procesautomatisering',
    type: 'AI-integraties en procesautomatisering',
    description:
      'Een heldere productwebsite voor praktische AI-integraties, met een gratis scan, concrete toepassingen en een uitlegbare workflow rond menselijke controle.',
    problem: 'Technische AI-diensten moesten concreet en begrijpelijk worden voor ondernemers zonder technisch jargon.',
    result: 'Een overzichtelijke productwebsite met praktische toepassingen, een gratis scan en een duidelijke werkwijze.',
    features: ['Gratis AI-scan', 'Procesautomatisering', 'Productvoorbeeld', 'Menselijke controle'],
    image: '/images/portfolio/aibouwers-home-20260803.webp',
    imageAlt: 'Screenshot van de actuele homepage van AIbouwers.nl',
    url: 'https://aibouwers.nl/',
    domain: 'aibouwers.nl',
  },
]
