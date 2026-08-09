import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPreferenceAction } from '@/components/marketing-preference-action'

export const metadata: Metadata = { title: 'E-mailvoorkeur bevestigen', robots: { index: false, follow: false } }

export default async function MarketingConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return <main className="legal-page"><div className="container legal-shell"><Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link><h1>Bevestig je e-mailvoorkeur</h1><p>Pas na deze bevestiging kan je e-mailadres voor marketingberichten worden geactiveerd.</p>{token ? <MarketingPreferenceAction token={token} action="confirm" /> : <p role="alert">De bevestigingslink mist een token.</p>}</div></main>
}
