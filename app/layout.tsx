import type { Metadata } from 'next'
import { Syne, DM_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-syne' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono' })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: {
    default: 'Landingspagina Laten Maken in 48 uur | Landingsite.nl',
    template: '%s | Landingsite.nl',
  },
  description:
    'Laat een professionele landingspagina maken voor je campagne, product of dienst. Binnen 48 uur online, vaste prijs vanaf €299 en hosting inbegrepen.',
  metadataBase: new URL('https://landingsite.nl'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://landingsite.nl',
    siteName: 'Landingsite.nl',
    title: 'Landingspagina laten maken in 48 uur',
    description:
      'Professionele landingspagina voor Nederlandse ondernemers. Binnen 48 uur live, vaste prijs vanaf €299 en hosting inbegrepen.',
    images: [
      {
        url: '/image_1.png',
        width: 1200,
        height: 630,
        alt: 'Landingsite.nl — professionele landingspagina snel online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landingspagina laten maken in 48 uur',
    description:
      'Binnen 48 uur een professionele landingspagina online. Vanaf €299. Geen bureau, geen gedoe.',
    images: ['/image_1.png'],
  },
  verification: {
    google: 'iN4lNqCMdhok5XwzhIlYx3uX-XSAuYl08Iju7wdV76M',
  },
  keywords: [
    'landingspagina laten maken',
    'snelle landingspagina',
    'landingspagina',
    'one pager laten maken',
    'conversiepagina',
    'actiepagina',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${syne.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
