export function LaunchCommandVisual() {
  return (
    <figure
      className="launch-command-visual"
      role="img"
      aria-label="Premium browsermockup van een converterende campagnepagina met launchstatus, formulier, pricing en analytics"
    >
      <div className="visual-glow visual-glow-primary" aria-hidden="true" />
      <div className="visual-glow visual-glow-secondary" aria-hidden="true" />
      <div className="command-orbit" aria-hidden="true" />
      <div className="command-diagonal command-diagonal-a" aria-hidden="true" />
      <div className="command-diagonal command-diagonal-b" aria-hidden="true" />

      <div className="command-browser">
        <div className="command-browser-top">
          <div className="browser-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="browser-address">landingsite.nl/launch/campagne</div>
          <div className="browser-ready">Campaign ready</div>
        </div>

        <div className="command-status-panel">
          <div>
            <span>48h launch process</span>
            <strong>Build 82%</strong>
          </div>
          <div className="status-progress" aria-hidden="true">
            <span />
          </div>
        </div>

        <div className="landing-preview-art">
          <section className="preview-hero-art">
            <div>
              <span>Campagnepagina</span>
              <i className="preview-line preview-line-wide" />
              <i className="preview-line preview-line-mid" />
              <b>Start aanvraag</b>
            </div>
            <div className="preview-device-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>

          <div className="preview-proof-strip">
            <span>Review strip</span>
            <strong>5.0</strong>
            <i />
            <i />
            <i />
          </div>

          <div className="preview-grid-art">
            <div className="visual-card visual-form-card">
              <span>Leadformulier</span>
              <i />
              <i />
              <i />
            </div>
            <div className="visual-card visual-metric-card">
              <span>Focusroute</span>
              <strong>1 doel</strong>
            </div>
            <div className="visual-card visual-price-card">
              <span>Pricing</span>
              <strong>Vanaf €299</strong>
            </div>
            <div className="visual-card visual-route-card">
              <span>Route</span>
              <strong>1 pagina · 1 doel</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="command-float command-float-time">Live in 48 uur</div>
      <div className="command-float command-float-price">Vanaf €299</div>
      <div className="command-float command-float-leads">Leads direct in je inbox</div>
      <div className="command-float command-float-offer">Geen offerte nodig</div>
    </figure>
  )
}
