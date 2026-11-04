import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer } from '@/components/site-interactions'
import { BrowserFrame, StudioFooter, StudioHeader } from '@/components/studio-site'
import { PartnerApplicationForm } from '@/components/partner-application-form'
import { PartnerConditionsSummary, PartnerExample, RollingCommissionExample } from '@/components/partner-program'
import { partnerProgramConfig } from '@/config/partner-program'
import { commercialConfig, websiteOffer } from '@/config/commercial'
import { portfolioProjects } from '@/data/portfolio'
import { calmSans, calmSerif } from '../fonts'
import styles from './partner.module.css'

export const metadata: Metadata = {
  title: 'Partner worden bij Landingsite.nl',
  description: 'Ken je een ondernemer die een website nodig heeft? Meld je gratis aan als partner. Bekijk de vergoeding, de voorwaarden en hoe aanmelden werkt.',
  alternates: { canonical: '/partner' },
  robots: { index: false, follow: true },
}

const faqs = [
  ['Moet ik betalen om partner te worden?', 'Nee. Deelname is gratis en er is geen startpakket of betaalde partnerregistratie.'],
  ['Wanneer ontvang ik commissie?', `Een aangebrachte klant moet een actief abonnement hebben en de maandfactuur moet betaald zijn. Daarna geldt een wachttijd van ${partnerProgramConfig.waitingPeriodDays} dagen. We controleren iedere vergoeding handmatig voordat die kan worden uitbetaald.`],
  ['Krijg ik betaald voor het aanmelden van partners?', 'Nee. Een registratie of introductie zonder actieve betalende websiteklant levert geen vergoeding op.'],
  ['Blijft mijn vergoeding altijd doorlopen?', 'Alleen zolang de gekoppelde klant een actief en betaald abonnement heeft en aan de voorwaarden is voldaan. Bij opzegging, een terugbetaling of een teruggedraaide incasso vervalt de gekoppelde toekomstige commissie. Er is geen inkomensgarantie.'],
  ['Hoe wordt uitbetaald?', `Maandelijks na handmatige controle, vanaf minimaal €${partnerProgramConfig.minimumPayout}. Lagere bedragen schuiven door. Automatische bankuitbetalingen zijn nog niet actief.`],
  ['Hoe wordt een verwijzing herkend?', `Via je partnercode. De maximale koppelperiode is ${partnerProgramConfig.attributionWindowDays} dagen. Standaard bewaren we de verwijzing alleen tijdens de browsersessie. Langer bewaren gebeurt alleen met toestemming. We gebruiken geen fingerprinting.`],
]

const steps = [
  ['Meld je gratis aan', 'We bekijken je aanvraag. Na goedkeuring ontvang je een eigen partnercode.'],
  ['Verwijs een ondernemer', 'De ondernemer gebruikt je partnerlink om een website te starten. Wij verzorgen de bouw en het beheer.'],
  ['Ontvang je vergoeding', 'Een betaalde abonnementsmaand kan commissie opleveren. Na de wachttijd en controle wordt die klaargezet.'],
]

const levels = [
  ['Jouw directe klant', 'Een ondernemer die jij zelf aanbrengt.', partnerProgramConfig.commissions.level1],
  ['Via jouw directe klant', 'Een betalende klant die door jouw directe klant is aangebracht.', partnerProgramConfig.commissions.level2],
  ['Een verwijzing verder', 'Een betalende klant die via het tweede niveau wordt aangebracht.', partnerProgramConfig.commissions.level3],
] as const

export default function PartnerPage() {
  const project = portfolioProjects[0]
  return (
    <div className={`studio studio-page studio--sales partner-studio ${styles.partner} ${calmSans.variable} ${calmSerif.variable}`}>
      <a className="skip-link" href="#partner-main">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <StudioHeader light />
      <main className="partner-page" id="partner-main" data-analytics-view="partner_page_view">
        <section className="partner-page-hero">
          <div className="studio-shell partner-introduction">
            <div className="partner-introduction__copy">
              <p className="overline">Het partnerprogramma</p>
              <h1>Partner worden bij Landingsite.nl.</h1>
              <p>Ken je een ondernemer die een website nodig heeft? Breng die bij ons. Wordt die klant en betaalt die voor het abonnement? Dan ontvang jij een vergoeding. Wij bouwen en beheren de website.</p>
              <div className="hero-actions"><a className="button button--primary" href="#aanmelden">Meld me aan als partner</a><a className="button button--text" href="#vergoeding">Bekijk de vergoeding</a></div>
              <p className="partner-introduction__note">Gratis aanmelden. Een partnercode volgt na goedkeuring.</p>
            </div>
            <figure className="partner-introduction__work">
              <BrowserFrame project={project} priority sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1296px) 45vw, 560px" />
              <figcaption><span>Een van de websites die we bouwen</span><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}<span className="sr-only">, opent in een nieuw tabblad</span></a></figcaption>
            </figure>
          </div>
        </section>

        <section className="section partner-how" aria-labelledby="partner-how-title"><div className="studio-shell">
          <div className="partner-section-heading"><h2 id="partner-how-title">Jij kent de ondernemer.<br />Wij maken de website.</h2><p>Je klant betaalt €{commercialConfig.management.monthlyPrice} per maand inclusief btw. Websitebouw, hosting en beheer zijn inbegrepen, met maximaal {commercialConfig.management.includedChangeMinutes} minuten kleine wijzigingen per maand.</p></div>
          <ol className="partner-steps">{steps.map(([title, description], index) => <li key={title}><span>{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
          <p className="partner-page-note">Het websiteaanbod omvat tot {websiteOffer.pages} pagina’s. <Link href="/start">Bekijk wat je klant krijgt</Link>.</p>
        </div></section>

        <section className="section partner-rewards" id="vergoeding" aria-labelledby="partner-reward-title"><div className="studio-shell">
          <div className="partner-reward-heading"><div><p className="overline">De vergoeding</p><h2 id="partner-reward-title">Per klant.<br />Per betaalde maand.</h2><p>Je krijgt commissie voor betaalde websiteabonnementen, niet voor het aanmelden van partners.</p></div><div className="partner-direct-reward"><span>Voor een klant die jij zelf aanbrengt</span><strong>€{partnerProgramConfig.commissions.level1}</strong><p>bruto vergoeding per betaalde abonnementsmaand, zolang aan de voorwaarden is voldaan.</p></div></div>
          <table className="partner-reward-table"><caption>De bestaande vergoedingen per verwijzingsniveau</caption><thead><tr><th scope="col">Via wie komt de klant?</th><th scope="col">Jouw bruto vergoeding per betaalde maand</th></tr></thead><tbody>{levels.map(([name, description, amount], index) => <tr key={name}><th scope="row"><span>Niveau {index + 1}</span>{name}<small>{description}</small></th><td>€{amount}</td></tr>)}</tbody></table>
          <dl className="partner-payout-facts"><div><dt>Wachttijd</dt><dd>{partnerProgramConfig.waitingPeriodDays} dagen na een betaalde maandfactuur.</dd></div><div><dt>Uitbetaling</dt><dd>Maandelijks vanaf €{partnerProgramConfig.minimumPayout}, na handmatige controle.</dd></div><div><dt>Onder het minimum?</dt><dd>Je opgebouwde bedrag schuift door.</dd></div></dl>
          <details className="partner-details"><summary>Bekijk het uitgebreide rekenvoorbeeld</summary><div className="partner-example-content"><PartnerExample /><RollingCommissionExample /></div></details>
        </div></section>

        <section className="section partner-rules" aria-labelledby="partner-rules-title"><div className="studio-shell"><h2 id="partner-rules-title">Goed om vooraf te weten.</h2><div className="partner-rules-grid">
          <PartnerConditionsSummary />
          <div className="partner-faq"><h3>Veelgestelde vragen</h3>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div></div></section>

        <section className="section partner-apply" aria-labelledby="partner-apply-title"><div className="studio-shell partner-apply-grid"><div><p className="overline">Aanmelden is gratis</p><h2 id="partner-apply-title">Meld je aan<br />als partner.</h2><p>Vertel wie je bent. We controleren je aanvraag en laten weten of je kunt deelnemen.</p><p>Een partnercode volgt pas na goedkeuring. IBAN en uitbetalingsgegevens vragen we later via een beveiligd proces.</p><Link href="/partnervoorwaarden">Lees de partnervoorwaarden</Link></div><PartnerApplicationForm /></div></section>
      </main>
      <StudioFooter />
    </div>
  )
}
