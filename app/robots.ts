import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/beheer/', '/intake/', '/genereren/'] },
    ],
    sitemap: 'https://landingsite.nl/sitemap.xml',
    host: 'https://landingsite.nl',
  }
}
