export type PortfolioProject = {
  slug: string
  name: string
  type: string
  description: string
  features: string[]
  image: string
  imageAlt: string
  url: string
  domain: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'wia-management',
    name: 'WIA Management',
    type: 'Leadgeneratie- en specialistmatching',
    description:
      'Een uitgebreide website voor werkgevers, HR en eigenrisicodragers, met een gerichte intakeflow, WIA-risicorekentool, kennisbank en koppeling aan een passende specialist.',
    features: ['Intakeflow', 'WIA-risicorekentool', 'Kennisbank', 'Specialistmatching'],
    image: '/images/portfolio/wiamanagement-home-20260801.webp',
    imageAlt: 'Screenshot van de actuele homepage van WIA Management',
    url: 'https://www.wiamanagement.nl/',
    domain: 'wiamanagement.nl',
  },
  {
    slug: 'ontwikkelbegeleiding-rh',
    name: 'Ontwikkelbegeleiding RH',
    type: 'Website voor lokale dienstverlening',
    description:
      'Een warme en overzichtelijke website voor kinder- en ouderbegeleiding in Veenendaal, met duidelijke informatie en een laagdrempelige route naar een kennismaking.',
    features: ['Lokale dienstverlening', 'Duidelijke navigatie', 'Persoonlijke positionering', 'Kennismakingsflow'],
    image: '/images/portfolio/ontwikkelbegeleiding-home-20260801.webp',
    imageAlt: 'Screenshot van de actuele homepage van Ontwikkelbegeleiding RH',
    url: 'https://www.ontwikkelbegeleiding.nl/',
    domain: 'ontwikkelbegeleiding.nl',
  },
]
