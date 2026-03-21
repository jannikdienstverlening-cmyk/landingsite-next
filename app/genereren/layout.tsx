import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagina wordt gegenereerd — Landingsite.nl',
  robots: { index: false, follow: false },
}

export default function GeneratingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
