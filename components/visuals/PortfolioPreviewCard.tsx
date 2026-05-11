type PortfolioPreviewCardProps = {
  name: string
  domain: string
  url: string
  label: string
  description: string
  tone: 'green' | 'blue'
}

export function PortfolioPreviewCard({
  name,
  domain,
  url,
  label,
  description,
  tone,
}: PortfolioPreviewCardProps) {
  return (
    <article className={`portfolio-case-card portfolio-case-${tone}`}>
      <div
        className="portfolio-browser-preview"
        role="img"
        aria-label={`Mini website-preview voor ${name}`}
      >
        <div className="portfolio-browser-top">
          <div className="browser-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span>{domain}</span>
        </div>
        <div className="portfolio-preview-page">
          <div className="portfolio-preview-hero">
            <i />
            <i />
            <b>{label}</b>
          </div>
          <div className="portfolio-preview-grid" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="portfolio-preview-form" aria-hidden="true">
            <span />
            <span />
            <strong />
          </div>
        </div>
      </div>

      <div className="portfolio-case-content">
        <span className="portfolio-case-label">{label}</span>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="portfolio-tags" aria-label="Project kenmerken">
          <span>Leadpagina</span>
          <span>Responsive</span>
          <span>Conversiegericht</span>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="portfolio-case-link">
          Bekijk project
        </a>
      </div>
    </article>
  )
}
