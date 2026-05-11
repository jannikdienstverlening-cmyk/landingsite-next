export function LaunchCommandVisual() {
  return (
    <div
      className="launch-visual"
      role="img"
      aria-label="Futuristisch campagne-dashboard met landingspagina-preview, 48-uurs voortgang en conversiekaarten"
    >
      <div className="launch-ring launch-ring-a" aria-hidden="true" />
      <div className="launch-ring launch-ring-b" aria-hidden="true" />
      <div className="launch-line launch-line-a" aria-hidden="true" />
      <div className="launch-line launch-line-b" aria-hidden="true" />

      <div className="command-window">
        <div className="command-topbar">
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="command-url">landingsite.nl/launch/campagne</div>
          <div className="command-status">Campaign ready</div>
        </div>

        <div className="command-progress">
          <span>48h launch process</span>
          <strong>82%</strong>
          <div className="progress-track" aria-hidden="true">
            <span />
          </div>
        </div>

        <div className="page-preview">
          <div className="preview-main">
            <span>Landing preview</span>
            <div className="preview-heading">
              <i />
              <i />
            </div>
            <p>Een heldere campagnepagina met focus, bewijs en een directe actie.</p>
            <b>Start aanvraag</b>
          </div>

          <div className="preview-side">
            <div className="mini-form">
              <span>Leadformulier</span>
              <i />
              <i />
              <i />
            </div>
            <div className="conversion-card">
              <span>Focus score</span>
              <strong>+38%</strong>
            </div>
          </div>
        </div>

        <div className="command-bottom">
          <div>
            <span>Pricing card</span>
            <strong>Vanaf €299</strong>
          </div>
          <div>
            <span>CTA route</span>
            <strong>1 pagina · 1 doel</strong>
          </div>
        </div>
      </div>

      <div className="launch-float float-time">Live in 48 uur</div>
      <div className="launch-float float-price">Vanaf €299</div>
      <div className="launch-float float-goal">1 pagina · 1 doel</div>
      <div className="launch-float float-leads">Leads direct in je inbox</div>
      <div className="launch-float float-offer">Geen offerte nodig</div>
    </div>
  )
}
