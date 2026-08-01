import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import { pricingConfig } from '@/config/pricing'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Landingspagina laten maken + websitebeheer | Landingsite.nl', template: '%s | Landingsite.nl' },
  description: `Professionele landingspagina vanaf €${pricingConfig.buildPackages.starter.oneTimePrice}. Websitebeheer, hosting, beveiliging en kleine wijzigingen voor €${pricingConfig.websiteManagement.monthlyPrice} per maand.`,
  metadataBase: new URL('https://landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Landingspagina laten maken + websitebeheer',
    description: `Professionele landingspagina vanaf €${pricingConfig.buildPackages.starter.oneTimePrice} en Websitebeheer voor €${pricingConfig.websiteManagement.monthlyPrice} per maand vanaf livegang.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Landingspagina laten maken vanaf €${pricingConfig.buildPackages.starter.oneTimePrice}`,
    description: `Met Websitebeheer, beveiliging en kleine wijzigingen voor €${pricingConfig.websiteManagement.monthlyPrice} per maand vanaf livegang.`,
  },
  verification: { google: 'iN4lNqCMdhok5XwzhIlYx3uX-XSAuYl08Iju7wdV76M' },
  keywords: [
    'landingspagina laten maken',
    'website laten maken',
    'websitebeheer',
    'website laten onderhouden',
    'website hosting en onderhoud',
    'landingspagina abonnement',
    'website partnerprogramma',
    'websites aandragen',
    'terugkerende partnervergoeding',
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
