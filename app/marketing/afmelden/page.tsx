import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPreferenceAction } from '@/components/marketing-preference-action'

export const metadata: Metadata = { title: 'Afmelden voor e-mail', robots: { index: false, follow: false } }

export default async function MarketingUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return <main className="legal-page"><div className="container legal-shell"><Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link><h1>Afmelden voor marketingberichten</h1><p>Na afmelden blijft je e-mailadres op de suppressielijst staan, zodat het niet per ongeluk opnieuw wordt geïmporteerd.</p>{token ? <MarketingPreferenceAction token={token} action="unsubscribe" /> : <p role="alert">De afmeldlink mist een token.</p>}</div></main>
}
