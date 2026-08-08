import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/beheer/', '/intake/', '/genereren/'] },
    ],
    sitemap: 'https://www.landingsite.nl/sitemap.xml',
    host: 'https://www.landingsite.nl',
  }
}
