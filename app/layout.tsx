import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Landingspagina laten maken vanaf €299 | Landingsite.nl', template: '%s | Landingsite.nl' },
  description: 'Laat een professionele landingspagina maken voor je campagne, dienst of product. Eerste versie binnen 48 uur na betaling en complete intake, vanaf €299 excl. btw.',
  metadataBase: new URL('https://landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Een scherpe landingspagina, zonder weken wachten',
    description: 'Professionele landingspagina vanaf €299. Eerste versie binnen 48 uur na betaling en complete intake.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landingspagina laten maken vanaf €299',
    description: 'Eerste versie binnen 48 uur na betaling en complete intake.',
  },
  verification: { google: 'iN4lNqCMdhok5XwzhIlYx3uX-XSAuYl08Iju7wdV76M' },
  keywords: [
    'landingspagina laten maken',
    'website laten maken',
    'website abonnement',
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
