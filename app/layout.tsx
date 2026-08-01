import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Website laten maken vanaf €79 p/m | Landingsite.nl', template: '%s | Landingsite.nl' },
  description: 'Een professionele website vanaf €79 per maand, inclusief hosting, SSL, onderhoud, backups en support. Eerste versie binnen 48 uur na betaling en complete intake.',
  metadataBase: new URL('https://landingsite.nl'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Binnen 48 uur jouw eerste websiteversie',
    description: 'Professionele website vanaf €79 per maand, inclusief hosting, onderhoud en support.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website laten maken vanaf €79 p/m',
    description: 'Inclusief hosting, onderhoud, backups en support.',
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
