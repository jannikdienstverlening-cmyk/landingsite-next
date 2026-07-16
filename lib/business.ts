export const BUSINESS = {
  brandName: 'Landingsite.nl',
  legalName: 'Jannik Dienstverlening',
  chamberOfCommerceNumber: '65549430',
  vatId: 'NL001557133B48',
  email: 'info@landingsite.nl',
  website: 'https://landingsite.nl',
  termsUrl: 'https://landingsite.nl/algemene-voorwaarden',
  privacyUrl: 'https://landingsite.nl/privacybeleid',
  address: {
    street: 'Gortstraat 31',
    postalCode: '3905 BB',
    city: 'Veenendaal',
    country: 'Nederland',
    countryCode: 'NL',
  },
} as const

export const BUSINESS_ADDRESS = `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`
