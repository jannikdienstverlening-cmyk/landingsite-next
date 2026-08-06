import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PartnerApplicationForm } from '@/components/partner-application-form'
import { PartnerConditionsSummary, PartnerExample, RollingCommissionExample } from '@/components/partner-program'
import { partnerProgramConfig } from '@/config/partner-program'

export const metadata: Metadata = {
  title: 'Partnerprogramma voor websiteklanten',
  description: 'Breng ondernemers aan en ontvang terugkerende commissie op actieve Websitebeheer-abonnementen. Bekijk de werking, voorwaarden en het 5×5-rekenvoorbeeld.',
  alternates: { canonical: '/partner' },
}

const faqs = [
  ['Moet ik betalen om partner te worden?', 'Nee. Deelname is gratis en er is geen startpakket of betaalde partnerregistratie.'],
  ['Wanneer ontstaat commissie?', `Na een echte verkoop, een actief Websitebeheer-abonnement, een succesvol betaalde maandfactuur en de wachttijd van ${partnerProgramConfig.waitingPeriodDays} dagen. Iedere post blijft eerst onder handmatige controle.`],
  ['Krijg ik betaald voor het aanmelden van partners?', 'Nee. Een registratie of introductie zonder actieve betalende websiteklant levert geen vergoeding op.'],
  ['Is €475 per maand gegarandeerd?', 'Nee. Het 5×5-model is uitsluitend een rekenvoorbeeld. Het werkelijke bedrag hangt af van actieve klanten, betalingen, opzeggingen, refunds en controles.'],
  ['Hoe wordt uitbetaald?', `Maandelijks na handmatige controle, vanaf minimaal €${partnerProgramConfig.minimumPayout}. Lagere bedragen schuiven door. Automatische bankuitbetalingen zijn nog niet actief.`],
  ['Hoe lang blijft een partnerlink geldig?', `Een geldige eerste-party verwijzing heeft een attributieperiode van ${partnerProgramConfig.attributionWindowDays} dagen. We gebruiken geen fingerprinting.`],
]

export default function PartnerPage() {
  return (
    <>
      <header className="partner-page-nav"><div className="shell"><Logo variant="light" /><Link href="#aanmelden" className="header-cta">Partner worden</Link></div></header>
      <main className="partner-page">
        <section className="partner-page-hero">
          <div className="shell">
            <p className="eyebrow"><span />Landingsite Partnerprogramma</p>
            <h1>Breng ondernemers aan. Ontvang terugkerende commissie.</h1>
            <p>Wanneer een aangebrachte ondernemer klant wordt en Websitebeheer afneemt, ontvang je een maandelijkse vergoeding zolang het abonnement actief en betaald blijft.</p>
            <div className="hero-actions"><a className="primary-button" href="#aanmelden">Partner worden</a><a className="secondary-button" href="#rekenvoorbeeld">Bekijk het rekenvoorbeeld</a></div>
          </div>
        </section>

        <section className="section partner-how"><div className="shell">
          <div className="section-head compact"><p className="section-kicker">Hoe het werkt</p><h2>Commissie volgt echte dienstverlening.</h2><p>Een partnercode registreert alleen de introductie. Er ontstaat pas commissie na een actieve en betaalde Websitebeheer-maandfactuur.</p></div>
          <div className="commission-levels partner-page-levels">
            <article><span>Niveau 1</span><p>Direct door jou aangebracht</p><strong>€{partnerProgramConfig.commissions.level1}<small>per betaalde maand</small></strong></article>
            <article><span>Niveau 2</span><p>Aangebracht door jouw directe klant</p><strong>€{partnerProgramConfig.commissions.level2}<small>per betaalde maand</small></strong></article>
            <article><span>Niveau 3</span><p>Aangebracht door de klant daaronder</p><strong>€{partnerProgramConfig.commissions.level3}<small>per betaalde maand</small></strong></article>
          </div>
          <p className="partner-page-note">Per Websitebeheer-abonnement worden maximaal drie niveaus beloond. Registraties, zelfverwijzingen en niet-betaalde abonnementen tellen niet mee.</p>
        </div></section>

        <section className="section partner-example-section"><div className="shell"><PartnerExample /><RollingCommissionExample /></div></section>

        <section className="section partner-rules"><div className="shell partner-rules-grid">
          <PartnerConditionsSummary />
          <div className="partner-faq"><p className="section-kicker">Veelgestelde vragen</p><h2>Duidelijk vóór je begint.</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div></section>

        <section className="section partner-apply"><div className="shell partner-apply-grid"><div><p className="section-kicker">Handmatige toelating</p><h2>Eerst controleren, daarna pas een partnercode.</h2><p>We controleren identiteit, zakelijke gegevens en mogelijke dubbele of kunstmatige constructies. IBAN en uitbetalingsgegevens vragen we pas later via een beveiligd proces.</p></div><PartnerApplicationForm /></div></section>
      </main>
    </>
  )
}
