export function FinalCtaVisual() {
  return (
    <figure
      className="final-cta-visual"
      role="img"
      aria-label="Mini browser-preview met live status en nieuwe leadmelding"
    >
      <div className="final-mini-browser">
        <div className="final-browser-top">
          <span />
          <span />
          <span />
          <b>pagina live</b>
        </div>
        <div className="final-browser-body">
          <div className="final-status-pill">Pagina live</div>
          <i className="final-line-wide" />
          <i className="final-line-short" />
          <b>Start aanvraag</b>
        </div>
      </div>
      <div className="lead-notification">
        <span>Nieuwe aanvraag ontvangen</span>
        <strong>+1 lead</strong>
      </div>
      <div className="final-time-badge">Binnen 48 uur</div>
    </figure>
  )
}
