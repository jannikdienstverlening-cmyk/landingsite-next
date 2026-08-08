export const BUSINESS = {
  brandName: 'Landingsite.nl',
  legalName: 'Jannik Dienstverlening',
  chamberOfCommerceNumber: '65549430',
  vatId: 'NL001557133B48',
  website: 'https://www.landingsite.nl',
  contactPath: '/#contact',
  termsUrl: 'https://www.landingsite.nl/algemene-voorwaarden',
  privacyUrl: 'https://www.landingsite.nl/privacybeleid',
  social: {
    instagram: 'https://www.instagram.com/landingsite.nl/',
    linkedin: 'https://www.linkedin.com/company/137164667/',
    tiktok: 'https://www.tiktok.com/@landingsite.nl',
  },
  address: {
    street: 'Gortstraat 31',
    postalCode: '3905 BB',
    city: 'Veenendaal',
    country: 'Nederland',
    countryCode: 'NL',
  },
} as const

export const BUSINESS_ADDRESS = `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`
