import type { Metadata } from 'next'
import { commercialConfig } from '@/config/commercial'
import type { SeoPageEntry } from '@/content/seo-pages'
import { BUSINESS } from './business'

export function seoMetadata(page: SeoPageEntry): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.canonical },
    robots: { index: page.indexable, follow: true },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: BUSINESS.brandName,
      title: page.title,
      description: page.description,
      url: page.canonical,
      images: [{ url: '/og/default.png', width: 1200, height: 630, alt: `${BUSINESS.brandName} - ${page.h1}` }],
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/og/default.png'] },
  }
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, BUSINESS.website).toString(),
    })),
  }
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    '@type': 'Service',
    '@id': `${new URL(path, BUSINESS.website)}#service`,
    name,
    description,
    provider: { '@id': `${BUSINESS.website}/#organization` },
    areaServed: { '@type': 'Country', name: 'Nederland' },
    offers: Object.entries(commercialConfig.packages).map(([id, item]) => ({
      '@type': 'Offer',
      name: item.name,
      price: item.oneTimePrice,
      priceCurrency: commercialConfig.currency,
      url: `${BUSINESS.website}/start?pakket=${id}`,
      availability: 'https://schema.org/InStock',
    })),
  }
}
