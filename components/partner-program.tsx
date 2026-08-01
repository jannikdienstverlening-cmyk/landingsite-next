import Link from 'next/link'
import { partnerProgramConfig } from '@/config/partner-program'
import { calculatePartnerExample } from '@/lib/partner'

const levelCopy = {
  1: 'jouw directe klanten',
  2: 'klanten aangebracht door jouw directe klanten',
  3: 'klanten aangebracht door de tweede laag',
} as const

export function PartnerExample({ compact = false }: { compact?: boolean }) {
  const example = calculatePartnerExample()

  return (
    <div className={`partner-example${compact ? ' is-compact' : ''}`} id={compact ? undefined : 'rekenvoorbeeld'}>
      <div className="partner-example-head">
        <p className="section-kicker">5 × 5-rekenvoorbeeld</p>
        <h3>Wat kan een 5×5-netwerk opleveren?</h3>
        <p>Een rekenvoorbeeld waarbij iedere partner vijf nieuwe betalende websiteklanten aanbrengt.</p>
      </div>
      <div className="example-levels">
        {example.levels.map((item) => (
          <div className="example-level" key={item.level}>
            <span>Laag {item.level} — {levelCopy[item.level]}</span>
            <strong>{item.customers} actieve klanten</strong>
            <p>{item.customers} × €{item.commission}</p>
            <b>€{item.earnings} per maand</b>
          </div>
        ))}
      </div>
      <div className="example-total">
        <div>
          <span>Totaal rekenvoorbeeld</span>
          <strong>{example.totalCustomers} actieve Websitebeheer-abonnementen in drie lagen</strong>
          <p>{example.levels.map((item) => `€${item.earnings}`).join(' + ')}</p>
        </div>
        <b>€{example.totalMonthlyEarnings}<small>per maand</small></b>
      </div>
      <p className="example-explanation">In dit rekenvoorbeeld ontvang je €{example.totalMonthlyEarnings} per maand zolang alle {example.totalCustomers} gekoppelde Websitebeheer-abonnementen actief en volledig betaald blijven.</p>
      <div className="example-disclaimer" role="note">
        <strong>Rekenvoorbeeld, geen inkomensgarantie.</strong>
        <p>De werkelijke vergoeding hangt af van aangebrachte klanten, succesvolle betalingen, opzeggingen, terugbetalingen en de geldende partnervoorwaarden. Bedragen zijn bruto partnervergoedingen; de deelnemer is zelf verantwoordelijk voor eventuele belastingverplichtingen.</p>
      </div>
    </div>
  )
}

export function RollingCommissionExample() {
  const chain = [
    ['A', '€0', 'niveau 4'],
    ['B', `€${partnerProgramConfig.commissions.level3}`, 'niveau 3'],
    ['C', `€${partnerProgramConfig.commissions.level2}`, 'niveau 2'],
    ['D', `€${partnerProgramConfig.commissions.level1}`, 'direct'],
    ['E', 'klant', 'actief beheer'],
  ]

  return (
    <div className="rolling-example">
      <div>
        <p className="section-kicker">Rollend systeem</p>
        <h3>Voorbeeldketen A → B → C → D → E</h3>
        <p>Voor het abonnement van E ontvangen D €20, C €5 en B €2. A ontvangt voor deze specifieke klant €0, omdat E voor A op niveau 4 staat.</p>
      </div>
      <ol aria-label="Rollende commissieketen">
        {chain.map(([partner, amount, level]) => (
          <li key={partner}><strong>{partner}</strong><span>{amount}</span><small>{level}</small></li>
        ))}
      </ol>
      <p className="rolling-note">Iedere partner heeft een eigen rollend venster van drie betaalde niveaus. Daardoor kan het netwerk verder groeien, terwijl per abonnement nooit meer dan €27 commissie wordt uitgekeerd.</p>
    </div>
  )
}

export function PartnerConditionsSummary({ link = true }: { link?: boolean }) {
  const conditions = [
    'Deelname is gratis; alleen echte websiteklanten tellen mee.',
    'Websitebeheer moet actief zijn en de maandfactuur moet succesvol zijn betaald.',
    'Bij stornering, refund of opzegging vervalt de gekoppelde toekomstige commissie.',
    `Uitbetaling is maandelijks vanaf €${partnerProgramConfig.minimumPayout}; lagere bedragen schuiven door.`,
    'Per abonnement worden maximaal drie niveaus beloond.',
    'Geen vergoeding voor registratie van partners, zelfverwijzingen of kunstmatige constructies.',
    'Alle bedragen zijn rekenvoorbeelden en vormen geen gegarandeerd inkomen.',
  ]

  return (
    <div className="partner-conditions">
      <h3>Belangrijkste voorwaarden</h3>
      <ul>{conditions.map((condition) => <li key={condition}><span aria-hidden="true">✓</span>{condition}</li>)}</ul>
      {link && <Link href="/partnervoorwaarden">Bekijk alle partnervoorwaarden</Link>}
    </div>
  )
}
