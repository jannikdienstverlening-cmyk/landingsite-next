export function ConversionFlowVisual() {
  return (
    <figure
      className="conversion-flow-visual"
      role="img"
      aria-label="Verticale landingspagina-preview met hero, USP's, bewijs, formulier, FAQ en eind-CTA"
    >
      <div className="flow-label flow-label-focus">Focus</div>
      <div className="flow-label flow-label-proof">Bewijs</div>
      <div className="flow-label flow-label-action">Actie</div>
      <div className="flow-label flow-label-conversion">Conversie</div>

      <div className="flow-browser-frame">
        <div className="flow-browser-top">
          <span />
          <span />
          <span />
          <b>campagne-preview</b>
        </div>
        <div className="flow-page-preview">
          <section className="flow-page-hero">
            <span>Hero</span>
            <i />
            <i />
            <b>Start aanvraag</b>
          </section>
          <section className="flow-page-usps">
            <span>USP&apos;s</span>
            <div />
            <div />
            <div />
          </section>
          <section className="flow-page-proof">
            <span>Bewijs</span>
            <strong>5.0 review score</strong>
          </section>
          <section className="flow-page-form">
            <span>Contactformulier</span>
            <i />
            <i />
            <i />
          </section>
          <section className="flow-page-faq">
            <span>FAQ</span>
            <i />
            <i />
          </section>
          <section className="flow-page-cta">
            <span>Eind-CTA</span>
            <strong>Vraag je pagina aan</strong>
          </section>
        </div>
      </div>
    </figure>
  )
}
