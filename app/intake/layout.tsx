import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intake — Landingsite.nl',
  robots: { index: false, follow: false },
}

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
