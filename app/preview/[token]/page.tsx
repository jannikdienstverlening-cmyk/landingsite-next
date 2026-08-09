import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDemoPreview } from '@/lib/crm'
import './preview.css'

export const metadata: Metadata = {
  title: 'Homepageconcept',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

export default async function PreviewPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ demo?: string }> }) {
  const [{ token }, { demo }] = await Promise.all([params, searchParams])
  const preview = await getDemoPreview(token, demo)
  if (!preview) notFound()
  const { prospect, content } = preview
  return <div className="concept-page">
    <div className="concept-notice"><strong>Conceptpreview door Landingsite.nl</strong><span>AI-concept · inhoud en claims moeten door {prospect.companyName} worden bevestigd · niet gepubliceerd</span></div>
    <header className="concept-nav"><a href="#top" className="concept-logo">{prospect.companyName}</a><nav><a href="#diensten">Diensten</a><a href="#over">Over ons</a><a href="#contact">Contact</a></nav><a className="concept-nav-cta" href="#contact">{content.primaryCta}</a></header>
    <main id="top">
      <section className="concept-hero"><div className="concept-orb one" /><div className="concept-orb two" /><div className="concept-wrap concept-hero-grid">
        <div><span className="concept-kicker">{content.eyebrow}</span><h1>{content.headline}</h1><p>{content.subheadline}</p><div className="concept-actions"><a className="concept-button" href="#contact">{content.primaryCta}<span>↗</span></a>{prospect.phone && <a className="concept-text-link" href={`tel:${prospect.phone}`}>{prospect.phone}</a>}</div><small className="generated-note">Concepttekst · nog te bevestigen door het bedrijf</small></div>
        <div className="concept-visual" aria-hidden="true"><div className="concept-visual-card"><span>{prospect.place}</span><strong>{prospect.sbiCodes[0]?.description ?? 'Lokale vakkennis'}</strong><i>Persoonlijk · helder · dichtbij</i></div></div>
      </div></section>
      <section className="concept-usps"><div className="concept-wrap concept-usp-grid">{content.usps.map((usp, index) => <article key={usp.title}><span>0{index + 1}</span><h2>{usp.title}</h2><p>{usp.text}</p></article>)}</div></section>
      <section className="concept-section" id="diensten"><div className="concept-wrap"><div className="concept-section-head"><span className="concept-kicker">Diensten</span><h2>Duidelijk aanbod.<br />Zonder omwegen.</h2><p>Deze diensten zijn afgeleid van openbare branche-informatie en zijn conceptueel totdat het bedrijf ze bevestigt.</p></div><div className="concept-services">{content.services.map((service) => <article key={service.title}><div className="service-icon">↗</div><h3>{service.title}</h3><p>{service.text}</p><span className="generated-chip">Concept</span></article>)}</div></div></section>
      <section className="concept-about" id="over"><div className="concept-wrap concept-about-grid"><div className="concept-photo"><span>{prospect.companyName.slice(0, 1)}</span><small>Eigen fotografie wordt na toestemming toegevoegd</small></div><div><span className="concept-kicker">Over ons</span><h2>Vakwerk begint met goed luisteren.</h2><p>{content.about}</p><span className="generated-chip">Over-ons-tekst nog te bevestigen</span></div></div></section>
      <section className="concept-reviews"><div className="concept-wrap"><div className="concept-section-head"><span className="concept-kicker">Ervaringen</span><h2>Ruimte voor echte klantverhalen.</h2></div><div className="concept-review-grid">{[1,2,3].map((item) => <article key={item}><div>★★★★★</div><p>Reviewplaceholder — hier komt uitsluitend een echte, door het bedrijf aangeleverde of verifieerbare review.</p><strong>Naam klant</strong><span className="generated-chip">Placeholder</span></article>)}</div></div></section>
      <section className="concept-contact" id="contact"><div className="concept-wrap concept-contact-grid"><div><span className="concept-kicker">Contact</span><h2>{content.finalTitle}</h2><p>{content.finalText}</p></div><div className="concept-contact-card">{prospect.phone && <a href={`tel:${prospect.phone}`}><span>Telefoon</span><strong>{prospect.phone}</strong></a>}{prospect.email && <a href={`mailto:${prospect.email}`}><span>E-mail</span><strong>{prospect.email}</strong></a>}<div><span>Werkgebied</span><strong>{prospect.place} en omgeving</strong></div><small>Contactgegevens zijn afkomstig uit openbare bedrijfsinformatie en moeten voor publicatie worden bevestigd.</small></div></div></section>
    </main>
    <footer className="concept-footer"><div className="concept-wrap"><strong>{prospect.companyName}</strong><span>Homepageconcept door Landingsite.nl · verloopt {new Date(preview.expiresAt).toLocaleDateString('nl-NL')}</span></div></footer>
  </div>
}
