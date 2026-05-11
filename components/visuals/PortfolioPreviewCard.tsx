import Image from 'next/image'

type PortfolioPreviewCardProps = {
  name: string
  domain: string
  url: string
  label: string
  description: string
  imageSrc: string
  imageAlt: string
  tags: string[]
  tone: 'green' | 'blue'
}

export function PortfolioPreviewCard({
  name,
  domain,
  url,
  label,
  description,
  imageSrc,
  imageAlt,
  tags,
  tone,
}: PortfolioPreviewCardProps) {
  return (
    <article className={`portfolio-case-card portfolio-case-${tone}`}>
      <div className="portfolio-browser-preview">
        <div className="portfolio-browser-top">
          <div className="browser-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span>{domain}</span>
        </div>
        <div className="portfolio-screenshot">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1440}
            height={1000}
            sizes="(max-width: 980px) calc(100vw - 56px), 560px"
            className="portfolio-screenshot-image"
          />
        </div>
      </div>

      <div className="portfolio-case-content">
        <span className="portfolio-case-label">{label}</span>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="portfolio-tags" aria-label="Project kenmerken">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="portfolio-case-link">
          Bekijk project
        </a>
      </div>
    </article>
  )
}
