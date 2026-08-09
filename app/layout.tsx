import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import { commercialConfig } from '@/config/commercial'
import './globals.css'
import './homepage.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Website laten maken vanaf €299 | Landingsite.nl', template: '%s | Landingsite.nl' },
  description: `Websites en landingspagina’s voor zzp en mkb. Eerste werkende versie binnen 48 uur. Bouw vanaf €${commercialConfig.packages.starter.oneTimePrice} en beheer voor €${commercialConfig.management.monthlyPrice} per maand.`,
  metadataBase: new URL('https://www.landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Website laten maken vanaf €299 | Landingsite.nl',
    description: 'Websites voor zzp en mkb. Eerste werkende versie binnen 48 uur. Bouw vanaf €299 en beheer voor €79 per maand.',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'Landingsite.nl - websites voor zzp en mkb' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website laten maken vanaf €299 | Landingsite.nl',
    description: 'Eerste werkende versie binnen 48 uur na betaling en complete intake.',
    images: ['/og/default.png'],
  },
  verification: { google: 'b1zb9KbeJjn0en587SxszRJ09cnt0CzRAANU47-3y-Q' },
  keywords: [
    'landingspagina laten maken',
    'website laten maken',
    'hosting en websitebeheer',
    'website laten onderhouden',
    'website hosting en onderhoud',
    'landingspagina laten maken',
    'website voor zzp',
    'website mkb',
    'professionele website',
    'website laten bouwen',
    'snelle landingspagina',
    'conversiepagina',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl" className={`${syne.variable} ${dmMono.variable}`}><body>{children}</body></html>
}
