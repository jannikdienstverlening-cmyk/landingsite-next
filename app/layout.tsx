import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import { commercialConfig } from '@/config/commercial'
import { seoPage } from '@/content/seo-pages'
import './globals.css'
import './homepage.css'
import './founder-portrait.css'
import './seo-pages.css'
import './sales-design.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })
const homepage = seoPage('/')

export const metadata: Metadata = {
  title: { default: homepage.title, template: '%s | Landingsite.nl' },
  description: homepage.description,
  metadataBase: new URL('https://www.landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.landingsite.nl',
    siteName: 'Landingsite.nl',
    title: homepage.title,
    description: homepage.description,
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'Landingsite.nl - websites voor zzp en mkb' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: homepage.title,
    description: `Websitebouw inbegrepen voor €${commercialConfig.management.monthlyPrice} per maand inclusief btw.`,
    images: ['/og/default.png'],
  },
  verification: { google: 'b1zb9KbeJjn0en587SxszRJ09cnt0CzRAANU47-3y-Q' },
  keywords: [
    'landingspagina laten maken',
    'website laten maken',
    'hosting en websitebeheer',
    'website laten onderhouden',
    'website hosting en onderhoud',
    'website voor zzp',
    'website mkb',
    'professionele website',
    'website laten bouwen',
    'snelle landingspagina',
    'conversiepagina',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl" data-scroll-behavior="smooth" className={`${syne.variable} ${dmMono.variable}`}><body>{children}</body></html>
}
