import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import { pricingConfig } from '@/config/pricing'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Professionele landingspagina laten maken | Landingsite.nl', template: '%s | Landingsite.nl' },
  description: `Laat een professionele landingspagina maken voor zzp of mkb. Eerste versie binnen 48 uur, vanaf €${pricingConfig.buildPackages.starter.oneTimePrice} en met direct contact met de bouwer.`,
  metadataBase: new URL('https://landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Professionele landingspagina laten maken',
    description: `Eerste versie binnen 48 uur, vanaf €${pricingConfig.buildPackages.starter.oneTimePrice} en optioneel ${pricingConfig.websiteManagement.name} na livegang.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Professionele landingspagina vanaf €${pricingConfig.buildPackages.starter.oneTimePrice}`,
    description: 'Voor zzp en mkb, mobielvriendelijk gebouwd en met direct persoonlijk contact.',
  },
  verification: { google: 'b1zb9KbeJjn0en587SxszRJ09cnt0CzRAANU47-3y-Q' },
  keywords: [
    'landingspagina laten maken',
    'website laten maken',
    'websitebeheer',
    'website laten onderhouden',
    'website hosting en onderhoud',
    'landingspagina abonnement',
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
