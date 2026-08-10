import type { MetadataRoute } from 'next'
import { publishedSeoPages } from '@/content/seo-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedSeoPages.filter((page) => page.includedInSitemap).map((page) => ({
    url: page.canonical,
    lastModified: new Date(`${page.updatedAt}T12:00:00+02:00`),
    changeFrequency: page.slug === '/' ? 'weekly' as const : page.slug === '/werk' ? 'monthly' as const : 'yearly' as const,
    priority: page.slug === '/' ? 1 : ['/werk', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/kosten-website-laten-maken'].includes(page.slug) ? .8 : .4,
  }))
}
