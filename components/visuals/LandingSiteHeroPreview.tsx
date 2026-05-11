export function LandingSiteHeroPreview() {
  return (
    <figure
      className="landing-site-hero-preview"
      role="img"
      aria-label="Rustige browserpreview van een converterende landingspagina"
    >
      <div className="hero-preview-glow" aria-hidden="true" />

      <div className="hero-preview-browser">
        <div className="hero-preview-top">
          <div className="browser-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="hero-preview-url">landingsite.nl/campagne</span>
        </div>

        <div className="hero-preview-page">
          <div className="hero-preview-hero">
            <div className="hero-preview-copy-art">
              <span className="hero-preview-chip">Campagnepagina</span>
              <i className="hero-line hero-line-xl" />
              <i className="hero-line hero-line-md" />
              <b>Start aanvraag</b>
            </div>

            <div className="hero-preview-form-card">
              <span>Leadformulier</span>
              <i />
              <i />
              <i />
              <strong>Verstuur</strong>
            </div>
          </div>

          <div className="hero-preview-proof">
            <strong>5.0</strong>
            <span>Heldere flow, snelle aanvraag en mobiel perfect.</span>
          </div>

          <div className="hero-preview-footer-row">
            <span>1 pagina · 1 doel</span>
            <strong>Vanaf &euro;299</strong>
          </div>
        </div>
      </div>

      <div className="hero-preview-badge hero-preview-badge-time">Live in 48 uur</div>
      <div className="hero-preview-badge hero-preview-badge-price">Vanaf &euro;299</div>
    </figure>
  )
}
